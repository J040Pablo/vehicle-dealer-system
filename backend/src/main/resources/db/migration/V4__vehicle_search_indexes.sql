-- Migration V4: Search Performance Indexes for Vehicle Filtering

CREATE INDEX idx_vehicles_brand_model_year ON vehicles(brand, model, year);
