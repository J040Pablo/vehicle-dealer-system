package com.dealership.api.security;

import com.dealership.api.user.Role;
import com.dealership.api.user.User;
import com.dealership.api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminBootstrapService adminBootstrapService;

    @BeforeEach
    void setUp() {
        lenient().when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "encoded_" + invocation.getArgument(0));
    }

    @Test
    @DisplayName("Cenário 1: Sem variáveis de ambiente (username/password vazios) -> Nenhum usuário ADMIN deve ser criado")
    void run_WithoutEnvVars_DoesNotCreateAdmin() {
        ReflectionTestUtils.setField(adminBootstrapService, "adminUsername", "");
        ReflectionTestUtils.setField(adminBootstrapService, "adminPassword", "");
        ReflectionTestUtils.setField(adminBootstrapService, "adminEmail", "");

        adminBootstrapService.run();

        verify(userRepository, never()).existsByUsername(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Cenário 2: Com variáveis de ambiente informadas -> Deve criar usuário administrador com Role.ADMIN e senha BCrypt")
    void run_WithEnvVars_CreatesAdminUser() {
        ReflectionTestUtils.setField(adminBootstrapService, "adminUsername", "sysadmin");
        ReflectionTestUtils.setField(adminBootstrapService, "adminPassword", "SecurePassword123!");
        ReflectionTestUtils.setField(adminBootstrapService, "adminEmail", "sysadmin@dealership.com");

        when(userRepository.existsByUsername("sysadmin")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        adminBootstrapService.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User createdUser = userCaptor.getValue();
        assertThat(createdUser.getUsername()).isEqualTo("sysadmin");
        assertThat(createdUser.getEmail()).isEqualTo("sysadmin@dealership.com");
        assertThat(createdUser.getRole()).isEqualTo(Role.ADMIN);
        assertThat(createdUser.getPassword()).isEqualTo("encoded_SecurePassword123!");
    }

    @Test
    @DisplayName("Cenário 3: Usuário administrador já existe no banco de dados -> Nenhuma duplicação deve ocorrer")
    void run_AdminAlreadyExists_DoesNotDuplicate() {
        ReflectionTestUtils.setField(adminBootstrapService, "adminUsername", "sysadmin");
        ReflectionTestUtils.setField(adminBootstrapService, "adminPassword", "SecurePassword123!");
        ReflectionTestUtils.setField(adminBootstrapService, "adminEmail", "sysadmin@dealership.com");

        when(userRepository.existsByUsername("sysadmin")).thenReturn(true);

        adminBootstrapService.run();

        verify(userRepository, times(1)).existsByUsername("sysadmin");
        verify(userRepository, never()).save(any(User.class));
    }
}
