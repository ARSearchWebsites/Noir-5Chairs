import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import product_card from "../data/product_data";
import ProductDisplay from "../Components/ProductDisplay";
import Footer from "../Components/Footer";
import Videosection from "../Components/Videosection";
import SecondHeader from "../Components/SecondHeader";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";
import { Product, TimeData } from "../types/types";
//import ARViewer from "../Components/ARViewer";
import ModelViewer from "../Components/ModelViewer";


/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const SingleProduct: React.FC = () => {
  /* ---------- query-params ---------- */
  const params = new URLSearchParams(window.location.search);
  const product_id = Number(params.get("product_id"));   // NaN if missing
  const [mode, setMode]     = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /* ---------- product & timing state ---------- */
  const [product, setProduct] = useState<Product | null>(null);
  const [pageStartTime, setPageStartTime] = useState<number>(0);
  const [initialTimeSpent, setInitialTimeSpent] = useState<number>(0);

  const [upperSectionStart, setUpperSectionStart] = useState<number | null>(null);
  const [timeSpentUpper,     setTimeSpentUpper]   = useState<number>(0);
  const [timeData,           setTimeData]         = useState<TimeData | null>(null);

  /* ---------- "version" flag ---------- */
  const version = useMemo(() => {
    const seen   = sessionStorage.getItem("productdetailsVersion");
    const order  = sessionStorage.getItem("shuffledIDs");
    if (!seen || !order || !product) return undefined;

    const seenArr  = JSON.parse(seen)  as boolean[];
    const orderArr = JSON.parse(order) as (number | string)[];
    const idx = orderArr.indexOf(product.id);
    return idx > -1 ? seenArr[idx] : undefined;
  }, [product]);

  /* ---------------------------------------------------------------- */
  /* One-time mount logic                                             */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    window.scrollTo(0, 0);

    setMode(params.get("mode"));
    setUserId(params.get("userId"));

    setPageStartTime(Date.now());

    const found = product_card.find((p) => p.id === product_id) as Product | undefined;
    setProduct(found ?? null);

    if (found) {
      const prev = Number(
        sessionStorage.getItem(`timeSpentOnSingleProductPage_${found.product_name}`) ?? "0",
      );
      setInitialTimeSpent(prev);
    }
  }, [product_id]);

  /* ---------------------------------------------------------------- */
  /* Persist total time on page when unmounting                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (!product) return;

      const elapsed = (Date.now() - pageStartTime) / 1_000;
      sessionStorage.setItem(
        `timeSpentOnSingleProductPage_${product.product_name}`,
        String(initialTimeSpent + elapsed),
      );
    };
  }, [pageStartTime, initialTimeSpent, product]);

  /* ---------------------------------------------------------------- */
  /* Hover-tracking for "presentation / upper" section                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const upper = document.querySelector<HTMLDivElement>(".uppersection");
    const single = document.querySelector<HTMLDivElement>(".single-product-page");
    const header = document.querySelector<HTMLDivElement>(".secondHeader");

    const start = () => setUpperSectionStart(Date.now());
    const stop  = () => {
      if (!upperSectionStart) return;
      const delta = (Date.now() - upperSectionStart) / 1_000;
      setTimeSpentUpper((prev) => prev + delta);
    };

    if (upper) {
      upper.addEventListener("mouseenter", start);
      if (mode !== "1") upper.addEventListener("mouseleave", stop);
    }
    if (mode === "1" && single && header) {
      single.addEventListener("mouseenter", stop);
      header.addEventListener("mouseenter", stop);
    }

    return () => {
      upper?.removeEventListener("mouseenter", start);
      if (mode !== "1") upper?.removeEventListener("mouseleave", stop);

      if (mode === "1" && single && header) {
        single.removeEventListener("mouseenter", stop);
        header.removeEventListener("mouseenter", stop);
      }
    };
  }, [upperSectionStart, mode]);

  /* ---------------------------------------------------------------- */
  /* When upper-section time changes, prepare the payload             */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (product)
      setTimeData({ productName: product.product_name, timeSpentInUpperSection: timeSpentUpper });
  }, [timeSpentUpper, product]);

  /* ---------------------------------------------------------------- */
  /* Firestore "Jetzt kaufen" logger                                  */
  /* ---------------------------------------------------------------- */
  const handleJetztKaufenClick = async (log: string): Promise<void> => {
    if (!userId) return;
    try {
      await setDoc(
        doc(db, "users", userId),
        { "Clicked Jetzt Kaufen": arrayUnion(log) },
        { merge: true },
      );
    } catch (err) {
      console.error("Firestore error (Jetzt Kaufen):", err);
    }
  };

  const handleViewInSpace = useCallback(() => {
    if (!product) return;
    // Top-level navigation ensures Scene Viewer / Quick Look may launch
    window.location.href = `https://ar-chair-viewer-six.vercel.app/?model=${encodeURIComponent(
      product.sku,
    )}`;
    // If you prefer a new tab on desktop, swap for:
    // window.open(url, "_blank", "noopener,noreferrer");
  }, [product]);

  /* ---------------------------------------------------------------- */
  if (!product) return <div>Loading…</div>;

  /* ---------------------------------------------------------------- */
  return (
    <section>
      <div className="secondHeader fixed top-0 left-0 w-full z-50">
        <SecondHeader
          userId={userId ?? ""}
          onClickJetztKaufen={handleJetztKaufenClick}
          product_id={String(product_id)}
          version={version}
          timeData={timeData ?? undefined}
        />
      </div>

      {/* Debug line you had – remove if no longer needed */}
      {/* {JSON.stringify(timeData)} */}

      <div className="uppersection mt-12 pt-12">
        <h1 className="text-[50px] font-extrabold text-center text-primary-blue">{product.product_name}</h1>

        {mode === "2" ? (
          <Videosection product={product} />
        ) : (
          <section className="mt-8 flex justify-center">
          <ModelViewer
          className="w-[300px] h-[250px] sm:w-[800px] sm:h-[480px]"
          id="ar-model"
          src="3Dimage1_atlas.glb"
          alt="3D model of an office chair"
          ar={true}
          arModes="webxr scene-viewer quick-look"
          ar-scale="auto"
          cameraControls={true}
          autoRotate={true}
    />
    </section>
        )}
      </div>

      <div className="single-product-page">
        <ProductDisplay
          userId={userId ?? ""}
          product={{
            ...product,
            id: String(product.id),
            product_name: product.product_name,
            farbe: product.farbe,
          }}
          mode={mode ?? undefined}
          timeData={timeData ?? { productName: product.product_name, timeSpentInUpperSection: 0 }}
        />
      </div>

      <Footer />
    </section>
  );
};

export default SingleProduct;

