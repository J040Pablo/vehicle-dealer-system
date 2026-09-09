import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { Alert, AlertTitle, AlertDescription } from "../alert";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../alert-dialog";
import { Avatar } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "../dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "../dropdown-menu";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "../form";
import { Input } from "../input";
import { Label } from "../label";
import { Separator } from "../separator";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "../sheet";
import { Skeleton } from "../skeleton";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "../table";
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction } from "../toast";
import { Toaster } from "../toaster";

describe("shadcn UI Components", () => {
  describe("Alert & Badge & Button", () => {
    it("should render Alert variants", () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert Message</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Alert Title")).toBeInTheDocument();
      expect(screen.getByText("Alert Message")).toBeInTheDocument();
    });

    it("should render Badge variants", () => {
      render(
        <div>
          <Badge variant="default">Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="destructive">Destructive Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
        </div>
      );

      expect(screen.getByText("Default Badge")).toBeInTheDocument();
      expect(screen.getByText("Secondary Badge")).toBeInTheDocument();
      expect(screen.getByText("Destructive Badge")).toBeInTheDocument();
      expect(screen.getByText("Outline Badge")).toBeInTheDocument();
    });

    it("should render Button variants and handle clicks", () => {
      const handleClick = vi.fn();

      render(
        <Button variant="outline" size="sm" onClick={handleClick}>
          Click Me
        </Button>
      );

      const btn = screen.getByRole("button", { name: "Click Me" });
      fireEvent.click(btn);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should render Button with asChild prop", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      expect(screen.getByRole("link", { name: "Link Button" })).toBeInTheDocument();
    });
  });

  describe("Card & Table & Skeleton & Separator", () => {
    it("should render Card compound components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should render Table structure", () => {
      render(
        <Table>
          <TableCaption>Caption</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Head</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText("Caption")).toBeInTheDocument();
      expect(screen.getByText("Head")).toBeInTheDocument();
      expect(screen.getByText("Cell")).toBeInTheDocument();
    });

    it("should render Skeleton and Separator", () => {
      const { container } = render(
        <div>
          <Skeleton className="h-4 w-10" />
          <Separator orientation="vertical" />
        </div>
      );

      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("Avatar & Input & Label", () => {
    it("should render Avatar fallback when image isn't provided", () => {
      render(<Avatar fallback="JD" alt="User Avatar" />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should render default fallback 'U' when no fallback prop is provided", () => {
      render(<Avatar />);

      expect(screen.getByText("U")).toBeInTheDocument();
    });

    it("should render fallback when Avatar image fails or is omitted", () => {
      render(<Avatar fallback="FB" />);

      expect(screen.getByText("FB")).toBeInTheDocument();
    });

    it("should render Input and Label", () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="Type username..." />
        </div>
      );

      expect(screen.getByLabelText("Username")).toBeInTheDocument();
    });
  });

  describe("AlertDialog & Dialog & Sheet & DropdownMenu", () => {
    it("should render AlertDialog compound components", () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open Alert</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Alert" }));
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("should render Sheet with different sides", () => {
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Sheet Left</SheetTitle>
              <SheetDescription>Side Left Description</SheetDescription>
            </SheetHeader>
            <SheetFooter>Sheet Footer</SheetFooter>
          </SheetContent>
        </Sheet>
      );

      fireEvent.click(screen.getByRole("button", { name: "Open Sheet" }));
      expect(screen.getByText("Sheet Left")).toBeInTheDocument();
    });

    it("should render DropdownMenu items", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem inset>Profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole("button", { name: "Open Menu" });
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(screen.getByText("My Account")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });
  });

  describe("Form & Toaster & Toast", () => {
    function TestForm() {
      const form = useForm({ defaultValues: { email: "" } });
      return (
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>We will never share your email.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      );
    }

    it("should render FormField with Label, Control, Description, and Message", () => {
      render(<TestForm />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByText("We will never share your email.")).toBeInTheDocument();
    });

    it("should render Toast structure and Toaster container", () => {
      render(
        <ToastProvider>
          <Toast variant="destructive">
            <ToastTitle>Error Toast</ToastTitle>
            <ToastDescription>Failed to complete action</ToastDescription>
            <ToastAction altText="Try again">Retry</ToastAction>
            <ToastClose />
          </Toast>
          <ToastViewport />
          <Toaster />
        </ToastProvider>
      );

      expect(screen.getByText("Error Toast")).toBeInTheDocument();
      expect(screen.getByText("Failed to complete action")).toBeInTheDocument();
    });
  });
});
