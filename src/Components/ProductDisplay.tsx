import React, { useEffect } from 'react';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { BsDot } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, arrayUnion } from '@firebase/firestore';
import { db } from '../services/firebase';
import { TimeData } from '../types/types';

interface ProductDisplayProps {
  product: { id: string; product_name: string; farbe: string };
  userId: string;
  mode?: string;
  timeData: TimeData;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  userId,
  mode,
  timeData,
}) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    const productIdSequence: number[] = JSON.parse(sessionStorage.getItem('shuffledIDs') ?? '[]');
    const shuffledIndex = productIdSequence.indexOf(Number(product.id));
    const productDetailsVersion: boolean[] = JSON.parse(
      sessionStorage.getItem('productdetailsVersion') ?? '[]',
    );

    await setDoc(
      doc(db, 'users', userId),
      {
        'Clicked More Information': arrayUnion(`${product.product_name} ${new Date().toISOString()}`),
        'Time Spent on Presentation Section': arrayUnion(timeData.productName ? timeData : 'Mobile view'),
      },
      { merge: true },
    );
    const versionValue = productDetailsVersion[shuffledIndex];

    navigate(
      `/product/moreinfo?mode=${mode}&product_id=${product.id}&userId=${userId}&isV=${versionValue === true ? "true" : "false"}`,
    );
  };

  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <section className="relative items-center p-2.5 mr-2.5 flex flex-col justify-around ">
      <h2 className="mb-4 text-center font-bold underline decoration-4 decoration-primary-blue text-[28px] text-primary-blue">
        Features
      </h2>

      <div className="space-y-4 items-center text-[25px] font-fira-sans mb-10 mt-10">
        {[
          { label: 'Price: $89.99', key: 'price' },
          { label: `Color: ${product.farbe}`, key: 'color' },
        ].map(({ label, key }) => (
          <li
            key={key}
            className="flex items-center font-round font-bold text-[18px]"
          >
            <BsDot className="mr-2" /> {label}
          </li>
        ))}

        
          <button
            onClick={handleClick}
            className="mt-4 flex items-center gap-2 bg-white px-4 py-4 font-bold text-[16px] 
                hover:shadow-[0px_1px_4px_rgba(0,0,0,0.16)] 
                hover:scale-[0.96] 
                transition-transform duration-150 "
          >
            <AiOutlineArrowRight /> MORE INFORMATION
          </button>
      </div>
    </section>
  );
};

export default ProductDisplay;
