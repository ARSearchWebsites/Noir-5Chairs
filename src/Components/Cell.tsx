import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";


export interface Shoe {
  id: string;
  product_name: string;
  price: string | number;
}

interface CellProps {
  shoe: Shoe;
  image: string;
  userId: string;
}

const Cell: React.FC<CellProps> = ({ shoe, image, userId }) => {
  const [mode, setMode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setMode(searchParams.get("mode"));
  }, []);

  const handleClick = async (): Promise<void> => {
    const productIdSequence: string[] =
      JSON.parse(sessionStorage.getItem("shuffledIDs") ?? "[]");
    const shuffledIndex = productIdSequence.indexOf(shoe.id);

    let productDetailsVersion: boolean[] =
      JSON.parse(sessionStorage.getItem("productdetailsVersion") ?? "[]");

    let lastValueRaw = sessionStorage.getItem("lastValue");
    let lastValue = lastValueRaw === null ? Math.random() < 0.5 : lastValueRaw === "true";

    if (typeof productDetailsVersion[shuffledIndex] !== "boolean") {
      lastValue = !lastValue;
      productDetailsVersion[shuffledIndex] = lastValue;
      sessionStorage.setItem(
        "productdetailsVersion",
        JSON.stringify(productDetailsVersion)
      );
      sessionStorage.setItem("lastValue", String(lastValue));
    }

    try {
      const ref = doc(db, "users", userId);
      await setDoc(
        ref,
        {
          "Clicked Shop Now": arrayUnion(
            `${shoe.product_name} ${new Date().toISOString()}`
          ),
        },
        { merge: true }
      );

      navigate(
        `/product?mode=${mode ?? ""}&product_id=${shoe.id}&userId=${userId}`
      );
    } catch (err) {
      console.error("Error during navigation or data update:", err);
    }
  };

  return (
    <div
      className={`border-[1px] border-[#FCE698] rounded-[2px]
        w-[270px] h-[370px] p-[10px] mt-[80px] 
        flex flex-col items-center text-center
        transition-transform duration-500 hover:scale-110 shadow-inner shadow-[inset_0_0_0_1px_rgba(252,230,152,1)]`}
    >
      <figure className="w-[70%] h-[70%] aspect-[4/3]">
        <img
          src={image}
          alt={shoe.product_name}
          className="object-contain w-full h-full mx-auto"
        />
      </figure>

      <p className="text-[22px] font-bold mb-1 font-['Tahoma'] text-[#364F6B]">
        {shoe.product_name}
      </p>
      <p className="text-[20px] font-bold text-black mb-4">
        {shoe.price}
      </p>

      <button
        onClick={handleClick}
        className={
          "bg-[#364F6B] text-white font-bold text-[20px] px-[4px] py-[2px] hover:bg-[#FCE698]  hover:text-[#364F6B] hover:text-[18px] transition-colors mb-[10px]"
        }
      >
        Shop now
      </button>
    </div>
  );
};

export default Cell;