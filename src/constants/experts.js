export const INDEX_ELASTICSEARCH = {
  experts : 'experts'
};

export const mapFacetFields = {
  'address': 'address.keyword',
  'degree': 'degree.keyword',
  'research_area': 'research_area.name.keyword',
  'research_area_en': 'research_area_en.name.keyword',
  'company': 'company.keyword',
};


export const mapFilterFields = {
  'degree': 'degree.keyword',
  'research_area': 'research_area.name.keyword',
  'research_area_en': 'research_area_en.name.keyword',
  'company': 'company.keyword',
  'address': 'address.keyword',
};

export const FACETS_TYPE = {
  degree: 'degree',
}