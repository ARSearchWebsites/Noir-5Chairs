import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";

export interface Chair {
  id: number;
  product_name: string;
  price: string | number;
}

interface CellProps {
  chair: Chair;
  image: string;
  userId: string;
}

const Cell: React.FC<CellProps> = ({ chair, image, userId }) => {
  const [mode, setMode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setMode(searchParams.get("mode"));
  }, []);

  const handleClick = async (): Promise<void> => {
    const productIdSequence: number[] = JSON.parse(
      sessionStorage.getItem("shuffledIDs") ?? "[]"
    );

    const shuffledIndex = productIdSequence.indexOf(Number(chair.id));

    if (shuffledIndex === -1) {
      console.warn("chair.id not found in shuffledIDs", {
        chairId: chair.id,
        shuffledIDs: productIdSequence, 
      });

      // Still allow navigation/logging even if experiment assignment fails
      navigate(`/product?mode=${mode ?? ""}&product_id=${chair.id}&userId=${userId}`);
      return;
    }

    let productDetailsVersion: unknown = null;
    try {
      productDetailsVersion = JSON.parse(
        sessionStorage.getItem("productdetailsVersion") ?? "[]"
      );
    } catch {
      productDetailsVersion = [];
    }

    let versions: (boolean | undefined)[] = Array.isArray(productDetailsVersion)
      ? (productDetailsVersion as (boolean | undefined)[])
      : [];

    // Ensure versions array matches shuffledIDs length
    if (versions.length !== productIdSequence.length) {
      versions = Array(productIdSequence.length).fill(undefined);
    }

    const lastValueRaw = sessionStorage.getItem("lastValue");
    let lastValue =
      lastValueRaw === null ? Math.random() < 0.5 : lastValueRaw === "true";

    // Assign if this product not assigned yet
    if (typeof versions[shuffledIndex] !== "boolean") {
      lastValue = !lastValue; // alternate A/B assignment
      versions[shuffledIndex] = lastValue;

      sessionStorage.setItem("productdetailsVersion", JSON.stringify(versions));
      sessionStorage.setItem("lastValue", String(lastValue));
    }

    try {
      const ref = doc(db, "users", userId);
      await setDoc(
        ref,
        {
          "Clicked Shop Now": arrayUnion(
            `${chair.product_name} ${new Date().toISOString()}`
          ),
        },
        { merge: true }
      );

      navigate(`/product?mode=${mode ?? ""}&product_id=${chair.id}&userId=${userId}`);
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
          alt={chair.product_name}
          className="object-contain w-full h-full mx-auto"
        />
      </figure>

      <p className="text-[22px] font-bold mb-1 font-['Tahoma'] text-[#364F6B]">
        {chair.product_name}
      </p>
      <p className="text-[20px] font-bold text-black mb-4">{chair.price}</p>

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
