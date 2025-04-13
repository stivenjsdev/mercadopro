type FilterValue = {
  id: string;
  name: string;
};

type Filter = {
  id: string;
  name: string;
  values: FilterValue[];
};

type SuggestedQueries = {
  q: string;
  match_start: number;
  match_end: number;
  is_verified_store: boolean;
  filters: Filter[];
};

export type SuggestionsResponse = {
  q: string;
  suggested_queries: SuggestedQueries[];
};

// ----

export type SearchResponse = {
  site_id: string;
  country_default_time_zone: string;
  query: string;
  paging: {
    total: number;
    primary_results: number;
    offset: number;
    limit: number;
  };
  results: Result[];
  user_context: unknown;
};

type Result = {
  id: string;
  title: string;
  condition: string;
  thumbnail_id: string;
  catalog_product_id: string;
  listing_type_id: string;
  sanitized_title: string;
  permalink: string;
  buying_mode: string;
  site_id: string;
  category_id: string;
  domain_id: string;
  thumbnail: string;
  currency_id: string;
  order_backend: number;
  price: number;
  original_price: number | null;
  sale_price: SalePrice;
  available_quantity: number;
  official_store_id: number | null;
  use_thumbnail_id: boolean;
  accepts_mercadopago: boolean;
  shipping: Shipping;
  stop_time: string;
  seller: Seller;
  attributes: Attribute[];
  installments: Installments;
  winner_item_id: string | null;
  catalog_listing: boolean;
  discounts: unknown;
  promotions: unknown[];
  differential_pricing: DifferentialPricing;
  inventory_id: string;
};

type SalePrice = {
  price_id: string;
  amount: number;
  conditions: Conditions;
  currency_id: string;
  exchange_rate: unknown;
  payment_method_prices: unknown[];
  payment_method_type: string;
  regular_amount: number | null;
  type: string;
  metadata: unknown;
};

type Conditions = {
  eligible: boolean;
  context_restrictions: unknown[];
  start_time: string | null;
  end_time: string | null;
};

type Shipping = {
  store_pick_up: boolean;
  free_shipping: boolean;
  logistic_type: string;
  mode: string;
  tags: string[];
  benefits: unknown;
  promise: unknown;
  shipping_score: number;
};

type Seller = {
  id: number;
  nickname: string;
};

type Attribute = {
  id: string;
  name: string;
  value_id: string | null;
  value_name: string | null;
  attribute_group_id: string;
  attribute_group_name: string;
  value_struct: ValueStruct | null;
  values: Value[];
  source: number;
  value_type: string;
};

type ValueStruct = {
  number: number;
  unit: string;
};

type Value = {
  id: string | null;
  name: string | null;
  struct: ValueStruct | null;
  source: number;
};

type Installments = {
  quantity: number;
  amount: number;
  rate: number;
  currency_id: string;
};

type DifferentialPricing = {
  id: number;
};

// ----

export interface UserInfo {
  id: number;
  nickname: string;
  registration_date: Date;
  first_name: string;
  last_name: string;
  gender: string;
  country_id: string;
  email: string;
  identification: Identification;
  address: Address;
  phone: Phone;
  alternative_phone: Phone;
  user_type: string;
  tags: string[];
  logo: null;
  points: number;
  site_id: string;
  permalink: string;
  seller_experience: string;
  bill_data: BillData;
  seller_reputation: SellerReputation;
  buyer_reputation: BuyerReputation;
  status: Status;
  secure_email: string;
  company: Company;
  credit: Credit;
  pwd_generation_status: string;
  context: unknown;
  registration_identifiers: unknown[];
}

interface Address {
  address: null;
  city: null;
  state: null;
  zip_code: null;
}

interface Phone {
  area_code: null | string;
  extension: string;
  number: string;
  verified?: boolean;
}

interface BillData {
  accept_credit_note: null;
}

interface BuyerReputation {
  canceled_transactions: number;
  tags: unknown[];
  transactions: BuyerReputationTransactions;
}

interface BuyerReputationTransactions {
  canceled: Canceled;
  completed: null;
  not_yet_rated: NotYetRated;
  period: string;
  total: null;
  unrated: Canceled;
}

interface Canceled {
  paid: null;
  total: null;
}

interface NotYetRated {
  paid: null;
  total: null;
  units: null;
}

interface Company {
  brand_name: null;
  city_tax_id: string;
  corporate_name: string;
  identification: string;
  state_tax_id: string;
  cust_type_id: string;
  soft_descriptor: null;
}

interface Credit {
  consumed: number;
  credit_level_id: string;
  rank: string;
}

interface Identification {
  number: null;
  type: null;
}

interface SellerReputation {
  level_id: null;
  power_seller_status: null;
  transactions: SellerReputationTransactions;
  metrics: Metrics;
}

interface Metrics {
  sales: Sales;
  claims: Cancellations;
  delayed_handling_time: Cancellations;
  cancellations: Cancellations;
}

interface Cancellations {
  period: string;
  rate: number;
  value: number;
}

interface Sales {
  period: string;
  completed: number;
}

interface SellerReputationTransactions {
  canceled: number;
  completed: number;
  period: string;
  ratings: Ratings;
  total: number;
}

interface Ratings {
  negative: number;
  neutral: number;
  positive: number;
}

interface Status {
  billing: Billing;
  buy: Buy;
  confirmed_email: boolean;
  shopping_cart: ShoppingCart;
  immediate_payment: boolean;
  list: Buy;
  mercadoenvios: string;
  mercadopago_account_type: string;
  mercadopago_tc_accepted: boolean;
  required_action: string;
  sell: Buy;
  site_status: string;
  user_type: string;
}

interface Billing {
  allow: boolean;
  codes: string[];
}

interface Buy {
  allow: boolean;
  codes: string[];
  immediate_payment: ImmediatePayment;
}

interface ImmediatePayment {
  reasons: unknown[];
  required: boolean;
}

interface ShoppingCart {
  buy: string;
  sell: string;
}

// ----

export interface TrendsResponse {
  keyword: string;
  url: string;
}

// ----
export interface Category {
  id: string;
  name: string;
  picture: string;
  permalink: string;
  total_items_in_this_category: number;
  path_from_root: PathFromRoot[];
  children_categories: ChildrenCategory[];
  attribute_types: string;
  settings: WelcomeSettings;
  channels_settings: ChannelsSetting[];
  meta_categ_id: null;
  attributable: boolean;
  date_created: Date;
}

interface ChannelsSetting {
  channel: string;
  settings: ChannelsSettingSettings;
}

interface ChannelsSettingSettings {
  minimum_price?: number;
  status?: string;
  buying_modes?: string[];
  immediate_payment?: string;
}

interface ChildrenCategory {
  id: string;
  name: string;
  total_items_in_this_category: number;
}

interface PathFromRoot {
  id: string;
  name: string;
}

export interface WelcomeSettings {
  adult_content: boolean;
  buying_allowed: boolean;
  buying_modes: string[];
  catalog_domain: string;
  coverage_areas: string;
  currencies: string[];
  fragile: boolean;
  immediate_payment: string;
  item_conditions: string[];
  items_reviews_allowed: boolean;
  listing_allowed: boolean;
  max_description_length: number;
  max_pictures_per_item: number;
  max_pictures_per_item_var: number;
  max_sub_title_length: number;
  max_title_length: number;
  max_variations_allowed: number;
  maximum_price: null;
  maximum_price_currency: string;
  minimum_price: number;
  minimum_price_currency: string;
  mirror_category: null;
  mirror_master_category: null;
  mirror_slave_categories: unknown[];
  price: string;
  reservation_allowed: string;
  restrictions: unknown[];
  rounded_address: boolean;
  seller_contact: string;
  shipping_options: string[];
  shipping_profile: string;
  show_contact_information: boolean;
  simple_shipping: string;
  stock: string;
  sub_vertical: null;
  subscribable: boolean;
  tags: unknown[];
  vertical: null;
  vip_subdomain: string;
  buyer_protection_programs: string[];
  status: string;
}

// ----
export type CategorySearchResponse = {
  domain_id: string;
  domain_name: string;
  category_id: string;
  category_name: string;
  attributes: unknown[]; // Cambia esto si conoces la estructura exacta
};
