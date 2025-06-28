/** Product type shared across the app */
export interface Product {
  id: number;
  product_name: string;
  price: string;       // keep as string because value + label (e.g. “from $89.99”)
  farbe: string;       // “farbe” = colour
  currency: string;
  thumb: string;       // local image path or URL
  sku: string;
  src: string; 
  images?: string[];        // 3-D embed URL
}

/** Immutable catalogue; feel free to rename `product_card` → `products` */
const product_card: readonly Product[] = [
  {
    id: 1,
    product_name: "Noir Atlas",
    price: "from $89.99",
    farbe: "Black",
    currency: "EURO",
    thumb: "./images/image2_atlas.png",
    sku: "3Dimage1_atlas",
    src: "https://sketchfab.com/models/cee12c29ebda4bcdb91b84a6f126a971/embed",
  },
  {
    id: 2,
    product_name: "Noir Sierra",
    price: "from $89.99",
    farbe: "Gray",
    currency: "EURO",
    thumb: "./images/image3_sierra.png",
    sku: "3Dimage2_sierra",
    src: "https://sketchfab.com/models/8541b1ebf4ff4fcbb14aabbe721e6e3b/embed",
  },
  {
    id: 3,
    product_name: "Noir Andes",
    price: "from $89.99",
    farbe: "Black",
    currency: "EURO",
    thumb: "./images/image4_andes.png",
    sku: "3Dimage3_andes",
    src: "https://sketchfab.com/models/2206e982ea5f40b5be49390308de2db3/embed",
  },
  {
    id: 4,
    product_name: "Noir Acadia",
    price: "from $89.99",
    farbe: "Gray",
    currency: "EURO",
    thumb: "./images/image5_acadia.png",
    sku: "3Dimage4_acadia",
    src: "https://sketchfab.com/models/cee12c29ebda4bcdb91b84a6f126a971/embed",
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
