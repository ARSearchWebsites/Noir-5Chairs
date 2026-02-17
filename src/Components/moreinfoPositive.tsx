// MoreinfoPositive.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactGA from "react-ga4";
import SecondHeader from "./SecondHeader";
import Footer from "./Footer";
import data from "../data/product_data";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";
import { Product } from "../types/types";

const MoreinfoPositive: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.href,
      title: "MoreInfo Page",
    });
  }, []);

  const params = new URLSearchParams(window.location.search);
  const product =
    data.find((p: Product) => String(p.id) === params.get("product_id")) ?? null;

  const userId = params.get("userId") ?? "";
  const version = params.get("isV");

  /* ---------------------------------------------------------------- */
  /* TIME ON DETAILS PAGE (per chair + total)                          */
  /* - uses refs to avoid "pageStartTime = 0" huge numbers             */
  /* ---------------------------------------------------------------- */
  const startRef = useRef<number>(Date.now());
  const initialRef = useRef<number>(0);

  const DETAILS_TOTAL_ALL_KEY = "timeSpentOnProductDetailsPage_all";
  const perKey = product
    ? `timeSpentOnProductDetailsPage_${product.product_name}`
    : null;

  // init timing once product is known
  useEffect(() => {
    if (!product || !perKey) return;

    startRef.current = Date.now();
    initialRef.current = Number(sessionStorage.getItem(perKey) ?? "0") || 0;
  }, [product, perKey]);

  // persist time on unmount (per chair + total)
  useEffect(() => {
    return () => {
      if (!product || !perKey) return;

      const elapsed = (Date.now() - startRef.current) / 1000;
      if (!Number.isFinite(elapsed) || elapsed < 0) return;

      // per chair
      sessionStorage.setItem(perKey, String(initialRef.current + elapsed));

      // total across chairs
      const prevAll =
        Number(sessionStorage.getItem(DETAILS_TOTAL_ALL_KEY) ?? "0") || 0;
      sessionStorage.setItem(DETAILS_TOTAL_ALL_KEY, String(prevAll + elapsed));
    };
  }, [product, perKey]);

  /* ---------- feature accordion state ---------- */
  const [open, setOpen] = useState({
    upholstery: false,
    backrest: false,
    seat: false,
    armrests: false,
  });

  const toggle = (key: keyof typeof open) =>
    setOpen((s) => ({ ...s, [key]: !s[key] }));

  /* ---------- Firestore logging (unchanged) ---------- */
  const logBuyNow = async (payload: string) =>
    setDoc(
      doc(db, "users", userId),
      { "Clicked Jetzt Kaufen": arrayUnion(payload) },
      { merge: true }
    );

  const logFeature = async (feature: string) =>
    setDoc(
      doc(db, "users", userId),
      { "Clicked Feature": arrayUnion(`${feature} ${new Date().toISOString()}`) },
      { merge: true }
    );

  if (!product) return <div>Loading…</div>;

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <SecondHeader
          userId={userId}
          product_id={params.get("product_id") ?? ""}
          version={version ?? undefined}
          onClickJetztKaufen={logBuyNow}
          timeData={{}}
        />
      </div>

      <main
        id="top"
        className="mt-20 px-10 mb-10 flex flex-col items-center text-center"
      >
        <h1 className="text-primary-blue text-[32px] font-bold my-8">
          Product Details
        </h1>

        <FeatureBlock
          title="Upholstery: Premium padding"
          open={open.upholstery}
          toggle={() => {
            toggle("upholstery");
            logFeature("Upholstery");
          }}
        >
          The {product.product_name} offers a breathable, premium upholstery with
          additional padding for superior seating comfort and durability.
        </FeatureBlock>

        <FeatureBlock
          title="Backrest: Reclining function included"
          open={open.backrest}
          toggle={() => {
            toggle("backrest");
            logFeature("Backrest");
          }}
        >
          The {product.product_name} features a reclining backrest, allowing for a
          more ergonomic sitting posture.
        </FeatureBlock>

        <FeatureBlock
          title="Adjustable seat height: 10 levels"
          open={open.seat}
          toggle={() => {
            toggle("seat");
            logFeature("Adjustable seat height");
          }}
        >
          The {product.product_name} features a 10-level adjustable seat height,
          allowing you to customize the chair to your individual height and
          seating preferences for optimal comfort.
        </FeatureBlock>

        <FeatureBlock
          title="Armrests: Adjustable and padded"
          open={open.armrests}
          toggle={() => {
            toggle("armrests");
            logFeature("Armrests");
          }}
        >
          The {product.product_name} includes height-adjustable, padded armrests
          for enhanced comfort and ergonomic support.
        </FeatureBlock>
      </main>

      <Footer />
    </>
  );
};

export default MoreinfoPositive;

interface FeatureProps {
  title: string;
  open: boolean;
  toggle: () => void;
  children: React.ReactNode;
}

const FeatureBlock: React.FC<FeatureProps> = ({ title, open, toggle, children }) => {
  return (
    <div className="w-full max-w-2xl py-4">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-start justify-between gap-4 text-left text-primary-blue text-xl font-semibold"
      >
        <span className="flex-1 text-center leading-snug">{title}</span>

        <span className="shrink-0 pt-1">
          {open ? <AiOutlineUp size={22} /> : <AiOutlineDown size={22} />}
        </span>
      </button>

      <p className={`${open ? "block mt-3" : "hidden"} text-black text-lg`}>
        {children}
      </p>
    </div>
  );
};
