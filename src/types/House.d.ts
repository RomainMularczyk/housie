type House = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  size: number;
  city: string;
  postCode: string;
  rooms: number;
  dpe: string | null;
  url: string;
  isFavorite: boolean;
  isArchived: boolean;
  isHousiaPicked: boolean;
  isUserPicked: boolean;
};

type HouseDatabase = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  size: number;
  city: string;
  postCode: string;
  rooms: number;
  dpe: string | null;
  url: string;
  isFavorite: 0 | 1;
  isArchived: 0 | 1;
  isHousiaPicked: 0 | 1;
  isUserPicked: 0 | 1;
};

type ScrapedHouse = Omit<
  House,
  'url' | 'id' | 'isFavorite' | 'isUserPicked' | 'isHousiaPicked' | 'isArchived'
>;

export { House, HouseDatabase, ScrapedHouse };
