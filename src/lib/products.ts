import sareeMaroon from "@/assets/p-saree-maroon.jpg";
import sareeEmerald from "@/assets/p-saree-emerald.jpg";
import sareeBlack from "@/assets/p-saree-black.jpg";
import kurtiBlue from "@/assets/p-kurti-blue.jpg";
import kurtiMustard from "@/assets/p-kurti-mustard.jpg";
import lehengaPink from "@/assets/p-lehenga-pink.jpg";
import lehengaRed from "@/assets/p-lehenga-red.jpg";
import sharara from "@/assets/p-sharara-cream.jpg";

export type Product = {
  id: string;
  name: string;
  category: "Saree" | "Kurti" | "Lehenga" | "Sharara";
  price: number;
  mrp: number;
  image: string;
  fabric: string;
  sizes: string[];
  rating: number;
  reviews: number;
  tagline: string;
  description: string;
};

export const products: Product[] = [
  { id: "ar-001", name: "Rani Banarasi Silk Saree", category: "Saree", price: 1899, mrp: 3499, image: sareeMaroon, fabric: "Banarasi Silk", sizes: ["Free Size"], rating: 4.6, reviews: 248, tagline: "Bestseller", description: "Hand-woven Banarasi silk in rich rani pink with traditional gold zari motifs. Comes with unstitched blouse piece." },
  { id: "ar-002", name: "Emerald Kanjivaram Drape", category: "Saree", price: 2299, mrp: 4199, image: sareeEmerald, fabric: "Kanjivaram Silk", sizes: ["Free Size"], rating: 4.7, reviews: 192, tagline: "New In", description: "Lustrous emerald Kanjivaram silk with antique gold border. Perfect for receptions and pujas." },
  { id: "ar-003", name: "Midnight Sequin Saree", category: "Saree", price: 1599, mrp: 2999, image: sareeBlack, fabric: "Georgette", sizes: ["Free Size"], rating: 4.5, reviews: 156, tagline: "Party Wear", description: "Flowing black georgette with hand-stitched silver sequin border. Drapes effortlessly." },
  { id: "ar-004", name: "Royal Blue Anarkali", category: "Kurti", price: 1199, mrp: 2199, image: kurtiBlue, fabric: "Rayon", sizes: ["S","M","L","XL","XXL"], rating: 4.4, reviews: 312, tagline: "Trending", description: "Floor-length anarkali in royal blue with intricate gold thread embroidery on yoke and hem." },
  { id: "ar-005", name: "Marigold Mirror Kurti", category: "Kurti", price: 799, mrp: 1499, image: kurtiMustard, fabric: "Chanderi Cotton", sizes: ["S","M","L","XL"], rating: 4.3, reviews: 421, tagline: "Daily Wear", description: "Breezy mustard chanderi kurti with traditional mirror work. Goes with leggings or palazzos." },
  { id: "ar-006", name: "Blush Pink Lehenga Set", category: "Lehenga", price: 3299, mrp: 5999, image: lehengaPink, fabric: "Net + Satin", sizes: ["S","M","L","XL"], rating: 4.8, reviews: 89, tagline: "Wedding Pick", description: "3-piece blush pink lehenga with zardosi work — lehenga, choli and dupatta included." },
  { id: "ar-007", name: "Sindoor Bridal Lehenga", category: "Lehenga", price: 4899, mrp: 8999, image: lehengaRed, fabric: "Velvet + Net", sizes: ["S","M","L","XL"], rating: 4.9, reviews: 64, tagline: "Bridal", description: "Heritage bridal red lehenga with heavy gota patti and zardosi. Comes with veil dupatta." },
  { id: "ar-008", name: "Ivory Gota Sharara Suit", category: "Sharara", price: 1799, mrp: 3299, image: sharara, fabric: "Georgette", sizes: ["S","M","L","XL"], rating: 4.6, reviews: 138, tagline: "Festive", description: "Ivory sharara suit with golden gota patti embroidery. Includes kurta, sharara and dupatta." },
];

export const getProduct = (id: string) => products.find(p => p.id === id);
export const categories = ["All","Saree","Kurti","Lehenga","Sharara"] as const;