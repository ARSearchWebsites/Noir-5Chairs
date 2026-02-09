import React, { FC } from 'react';
import product_card from '../data/product_data';
import Cell from './Cell';

interface ProductListProps {
  forwardedRef?: React.Ref<HTMLDivElement>;
  userId: string | null;
}

const shuffleArray = <T extends { id: number }>(array: readonly T[]): T[] => {
  const key = 'shuffledIDs';
  const stored = sessionStorage.getItem(key);

  const items = [...array];

  if (stored) {
    const order: number[] = JSON.parse(stored);
    items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    return items;
  }

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  sessionStorage.setItem(key, JSON.stringify(items.map((i) => String(i.id))));
  return items;
};

const ProductList: FC<ProductListProps> = ({ forwardedRef, userId }) => {
  const shuffledProducts = shuffleArray(product_card);

  return (
      <div
      id="productList"
      ref={forwardedRef}
      className="flex flex-col items-center mt-[80px]"
    >
      <h4 className="md:mb-[20px] text-[1.6rem] md:text-[2rem] font-bold text-[#364F6B] px-4 py-2 rounded text-center">
        Choose Your New Favorite Chair
      </h4>
      <div>
      <div className="flex flex-wrap justify-around gap-[20px] p-8 m-8 rounded-[2px] shadow-[0_0.5em_1em_-0.125em_rgba(10,10,10,0.1),0_0_0_1px_rgba(10,10,10,0.02)]">
        {shuffledProducts.map((item) => (
          <Cell
            key={item.id}
            userId={userId ?? ''}
            shoe={{ ...item, id: String(item.id) }}
            image={item.thumb}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default ProductList;
