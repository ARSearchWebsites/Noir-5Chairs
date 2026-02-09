import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BsCartCheckFill } from 'react-icons/bs';
import products from '../data/product_data';
import LOGO from '../assets/Logo_Noir.png';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';

type TimeData = Record<string, unknown>;

interface SecondHeaderProps {
  userId: string;
  onClickJetztKaufen: (log: string) => void;
  product_id: string | null;
  version?: string | boolean;
  timeData?: TimeData;
}

const SecondHeader: React.FC<SecondHeaderProps> = ({
  userId,
  onClickJetztKaufen,
  product_id,
  version,
  timeData,
}) => {
  const [mode, setMode] = useState<string | null>(null);
  const [productName, setProductName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMode(params.get('mode'));

    const pid = params.get('product_id');
    const found = products.find((p) => String(p.id) === pid);
    if (found) setProductName(found.product_name);
  }, []);

  const handleClick = async (where: string) => {
    if (!userId) return;

    if (timeData) {
      await setDoc(
        doc(db, 'users', userId),
        { 'Time Spent on Presentation Section': arrayUnion(timeData) },
        { merge: true },
      );
    }
    onClickJetztKaufen(`${where} ${new Date().toISOString()}`);
  };

  return (
    <header className="bg-secondary flex items-center justify-between px-4 py-1 w-full">
      <div className="flex items-center gap-2 mdx:w-1/2 lg:w-auto">
        <NavLink to={`/home?mode=${mode}&userId=${userId}`}>
          <img src={LOGO} alt="Noir logo" className="w-[90px] h-[70px] hidden ssm:block" />
        </NavLink>

        <NavLink
          to={`/home?mode=${mode}&userId=${userId}`}
          onClick={() => handleClick('Home')}
          className="font-bold text-[1.2rem] md:text-[1.8rem] mid:text-3xl text-primary-blue p-3 md:pl-6"
        >
          Home
        </NavLink>
      </div>

      <NavLink
        to={`/thankyou?mode=${mode}&userId=${userId}&product_id=${product_id}&isV=${version}`}
        className="md:mr-20 flex items-center gap-1 text-primary-blue"
        onClick={() => handleClick(productName || 'Product')}
      >
        <BsCartCheckFill size={26} className="" />
        <h3 className="text-[1rem] md:text-[1.2rem] sm:text-[12px] font-bold">Buy {productName} Now</h3>
      </NavLink>
    </header>
  );
};

export default SecondHeader;
