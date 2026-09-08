-- Migration V3: Search Performance Indexes for Vehicle Filtering

CREATE INDEX idx_vehicles_search ON vehicles(brand, model, year);
