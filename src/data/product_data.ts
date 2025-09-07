/** Product type shared across the app */
export interface Product {
  id: number;
  product_name: string;
  price: string;       
  farbe: string;       
  currency: string;
  thumb: string;       
  sku: string;
  src: string; 
  images?: string[];        
}

const product_card: readonly Product[] = [
  {
    id: 1,
    product_name: "Noir Atlas",
    price: "from $89.99",
    farbe: "Black",
    currency: "EURO",
    thumb: "./images/image2_atlas.png",
    sku: "3Dimage1_atlas",
    src: "https://sketchfab.com/models/2bdbfaf695c04dd998a9de0ee41be9da/embed",
  },
  {
    id: 2,
    product_name: "Noir Sierra",
    price: "from $89.99",
    farbe: "Gray",
    currency: "EURO",
    thumb: "./images/image3_sierra.png",
    sku: "3Dimage2_sierra",
    src: "https://sketchfab.com/models/3e0d5699f1cf45fc9d43bb56d8d8cf1c/embed",
  },
  {
    id: 3,
    product_name: "Noir Andes",
    price: "from $89.99",
    farbe: "Black",
    currency: "EURO",
    thumb: "./images/image4_andes.png",
    sku: "3Dimage3_andes",
    src: "https://sketchfab.com/models/6aef8b2c673a41ad8698f0b8689a09a3/embed",
  },
  {
    id: 4,
    product_name: "Noir Acadia",
    price: "from $89.99",
    farbe: "Gray",
    currency: "EURO",
    thumb: "./images/image5_acadia.png",
    sku: "3Dimage4_acadia",
    src: "https://sketchfab.com/models/976e7673eff24fb7b8bd41d23145f03d/embed",
  },
  {
    id: 5,
    product_name: "Noir Savanna",
    price: "from $89.99",
    farbe: "Brown",
    currency: "EURO",
    thumb: "./images/image6_savanna.png",
    sku: "3Dimage5_savanna",
    src: "https://sketchfab.com/models/5502908492f644e99545b7d4f675bc1a/embed",
  },
];

export default product_card;
