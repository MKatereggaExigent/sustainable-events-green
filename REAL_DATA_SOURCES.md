# Real Data Sources for EcobServe Planner Tier

This document lists all the **REAL** public APIs and data sources we will integrate. **NO MOCK/DUMMY DATA**.

---

## 🌍 Carbon Offset Projects

### 1. **Gold Standard Registry API**
- **URL**: https://registry.goldstandard.org/
- **Purpose**: Real verified carbon offset projects worldwide
- **Data**: Project names, locations, carbon credits, certifications
- **Filter**: South African projects
- **Status**: ⏳ To be integrated

### 2. **Verra (VCS) Registry API**
- **URL**: https://registry.verra.org/app/search/VCS
- **Purpose**: Verified Carbon Standard projects
- **Data**: Real carbon offset projects with pricing
- **Status**: ⏳ To be integrated

### 3. **Climate Action Reserve**
- **URL**: https://thereserve.apx.com/mymodule/reg/prjView.asp
- **Purpose**: North American carbon offset projects
- **Status**: ⏳ To be integrated

---

## 🏢 Eco-Friendly Suppliers & Venues

### 1. **Green Building Council South Africa (GBCSA)**
- **URL**: https://gbcsa.org.za/
- **Purpose**: Certified green buildings and venues in SA
- **Data**: Green Star certified venues, contact info
- **Status**: ⏳ Requires API access or web scraping

### 2. **B Corporation Directory**
- **URL**: https://www.bcorporation.net/en-us/find-a-b-corp/
- **API**: https://www.bcorporation.net/api/
- **Purpose**: Certified B Corps in South Africa
- **Data**: Sustainable businesses, certifications, ratings
- **Status**: ⏳ To be integrated

### 3. **Fair Trade South Africa**
- **URL**: https://www.fairtradesouthafrica.org.za/
- **Purpose**: Fair Trade certified suppliers
- **Data**: Ethical suppliers, certifications
- **Status**: ⏳ Requires API access

### 4. **Organic SA**
- **URL**: https://organicsa.co.za/
- **Purpose**: Organic certified food suppliers
- **Data**: Organic catering companies
- **Status**: ⏳ Requires API access

---

## 📊 Industry Benchmarks & Emissions Data

### 1. **EPA GHG Emissions Data**
- **URL**: https://www.epa.gov/ghgemissions
- **API**: https://www.epa.gov/enviro/web-services
- **Purpose**: Real greenhouse gas emissions data
- **Data**: Industry benchmarks, emission factors
- **Status**: ⏳ To be integrated

### 2. **DEFRA Conversion Factors (UK)**
- **URL**: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
- **Purpose**: Official GHG conversion factors
- **Data**: Carbon emissions per activity type
- **Status**: ⏳ Download and import CSV

### 3. **Carbon Trust Datasets**
- **URL**: https://www.carbontrust.com/
- **Purpose**: Industry-specific carbon footprint data
- **Status**: ⏳ To be integrated

### 4. **South African National GHG Inventory**
- **URL**: https://www.environment.gov.za/
- **Purpose**: SA-specific emissions data
- **Status**: ⏳ To be integrated

---

## 🌱 Sustainability Certifications

### 1. **ISO 14001 Certified Companies**
- **URL**: https://www.iso.org/
- **Purpose**: Environmental management certified companies
- **Status**: ⏳ Requires database access

### 2. **LEED Certified Buildings**
- **URL**: https://www.usgbc.org/projects
- **Purpose**: LEED certified venues
- **Status**: ⏳ To be integrated

---

## 💰 Carbon Pricing Data

### 1. **World Bank Carbon Pricing Dashboard**
- **URL**: https://carbonpricingdashboard.worldbank.org/
- **API**: Available via World Bank API
- **Purpose**: Real-time carbon pricing data
- **Status**: ⏳ To be integrated

### 2. **EU ETS Carbon Price**
- **URL**: https://ember-climate.org/data/data-tools/carbon-price-viewer/
- **Purpose**: European carbon market prices
- **Status**: ⏳ To be integrated

---

## 🔄 Real-Time Environmental Data

### 1. **OpenWeatherMap Air Quality API**
- **URL**: https://openweathermap.org/api/air-pollution
- **Purpose**: Real-time air quality data for event locations
- **Status**: ⏳ To be integrated

### 2. **IQAir API**
- **URL**: https://www.iqair.com/air-pollution-data-api
- **Purpose**: Real-time air quality and pollution data
- **Status**: ⏳ To be integrated

---

## 📈 Implementation Priority

### Phase 1 (Immediate)
1. ✅ Set up data fetcher service structure
2. ⏳ Integrate Gold Standard Registry API
3. ⏳ Integrate Verra VCS Registry
4. ⏳ Download DEFRA conversion factors

### Phase 2 (Next Sprint)
1. ⏳ Integrate B Corp directory
2. ⏳ Integrate EPA GHG data
3. ⏳ Integrate World Bank carbon pricing

### Phase 3 (Future)
1. ⏳ GBCSA member directory (requires partnership)
2. ⏳ Fair Trade SA suppliers
3. ⏳ Real-time air quality integration

---

## 🔑 API Keys Required

Add these to your `.env` file:

```bash
# Carbon Offset Registries
GOLD_STANDARD_API_KEY=your_key_here
VERRA_API_KEY=your_key_here

# B Corporation
BCORP_API_KEY=your_key_here

# Environmental Data
EPA_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
IQAIR_API_KEY=your_key_here

# World Bank
WORLD_BANK_API_KEY=your_key_here
```

---

## 📝 Notes

- **NO DUMMY DATA**: All data must come from verified public sources
- **Regular Updates**: Data should be refreshed daily/weekly via cron jobs
- **Caching**: Cache API responses to avoid rate limits
- **Fallbacks**: If APIs are unavailable, show "Data temporarily unavailable" instead of fake data

---

**Last Updated**: 2026-03-21

