import React, { useState, useEffect, useMemo, useCallback } from "react";
import product_card from "../data/product_data";
import ProductDisplay from "../Components/ProductDisplay";
import Footer from "../Components/Footer";
import SecondHeader from "../Components/SecondHeader";
import { doc, setDoc, arrayUnion } from "@firebase/firestore";
import { db } from "../services/firebase";
import { Product, TimeData } from "../types/types";

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const SingleProduct: React.FC = () => {
  /* ---------- query-params ---------- */
  const product_id = Number(
    new URLSearchParams(window.location.search).get("product_id")
  );
  const [mode, setMode] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /* ---------- product & timing state ---------- */
  const [product, setProduct] = useState<Product | null>(null);
  const [pageStartTime, setPageStartTime] = useState<number>(0);
  const [initialTimeSpent, setInitialTimeSpent] = useState<number>(0);

  const [upperSectionStart, setUpperSectionStart] = useState<number | null>(
    null
  );
  const [timeSpentUpper, setTimeSpentUpper] = useState<number>(0);
  const [timeData, setTimeData] = useState<TimeData | null>(null);

  /* ------------------------------------------------------------------ */
  /* AWAY TIME KEYS                                                     */
  /* ------------------------------------------------------------------ */
  const AWAY_START_KEY = "singleProduct_awayStart";
  const AWAY_TOTAL_KEY = "singleProduct_awayTotalSeconds";

  const startAway = useCallback(() => {
    if (!sessionStorage.getItem(AWAY_START_KEY)) {
      sessionStorage.setItem(AWAY_START_KEY, String(Date.now()));
    }
  }, []);

  const stopAwayAndAccumulate = useCallback(() => {
    const awayStart = Number(sessionStorage.getItem(AWAY_START_KEY) ?? "0");
    if (!awayStart) return;

    const deltaSec = (Date.now() - awayStart) / 1000;
    const prev = Number(sessionStorage.getItem(AWAY_TOTAL_KEY) ?? "0");

    sessionStorage.setItem(AWAY_TOTAL_KEY, String(prev + deltaSec));
    sessionStorage.removeItem(AWAY_START_KEY);
  }, []);

  /* ---------- version flag ---------- */
  const version = useMemo(() => {
    const seen = sessionStorage.getItem("productdetailsVersion");
    const order = sessionStorage.getItem("shuffledIDs");
    if (!seen || !order || !product) return undefined;

    const seenArr = JSON.parse(seen) as boolean[];
    const orderArr = JSON.parse(order) as (number | string)[];
    const idx = orderArr.indexOf(product.id);
    return idx > -1 ? seenArr[idx] : undefined;
  }, [product]);

  /* ---------------------------------------------------------------- */
  /* One-time mount logic                                             */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);

    setMode(params.get("mode"));
    setUserId(params.get("userId"));

    setPageStartTime(Date.now());

    const found = product_card.find((p) => p.id === product_id) as
      | Product
      | undefined;

    setProduct(found ?? null);

    if (found) {
      const prev = Number(
        sessionStorage.getItem(
          `timeSpentOnSingleProductPage_${found.product_name}`
        ) ?? "0"
      );
      setInitialTimeSpent(prev);
    }

    // If user returns to this page and awayStart exists,
    // immediately close that away timer
    stopAwayAndAccumulate();
  }, [product_id, stopAwayAndAccumulate]);

  /* ---------------------------------------------------------------- */
  /* Persist total time on page when unmounting                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (!product) return;

      const elapsed = (Date.now() - pageStartTime) / 1000;

      sessionStorage.setItem(
        `timeSpentOnSingleProductPage_${product.product_name}`,
        String(initialTimeSpent + elapsed)
      );
    };
  }, [pageStartTime, initialTimeSpent, product]);

  /* ---------------------------------------------------------------- */
  /* Visibility + lifecycle tracking (AWAY TIME)                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") startAway();
      if (document.visibilityState === "visible") stopAwayAndAccumulate();
    };

    const onPageHide = () => startAway();
    const onPageShow = () => stopAwayAndAccumulate();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [startAway, stopAwayAndAccumulate]);

  /* ---------------------------------------------------------------- */
  /* Hover-tracking for upper section                                 */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const upper = document.querySelector<HTMLDivElement>(".uppersection");
    const single =
      document.querySelector<HTMLDivElement>(".single-product-page");
    const header = document.querySelector<HTMLDivElement>(".secondHeader");

    const start = () => setUpperSectionStart(Date.now());
    const stop = () => {
      if (!upperSectionStart) return;
      const delta = (Date.now() - upperSectionStart) / 1000;
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
  /* Update timeData                                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (product)
      setTimeData({
        productName: product.product_name,
        timeSpentInUpperSection: timeSpentUpper,
      });
  }, [timeSpentUpper, product]);

  /* ---------------------------------------------------------------- */
  /* Firestore logger                                                  */
  /* ---------------------------------------------------------------- */
  const handleJetztKaufenClick = async (log: string): Promise<void> => {
    if (!userId) return;

    try {
      await setDoc(
        doc(db, "users", userId),
        { "Clicked Jetzt Kaufen": arrayUnion(log) },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore error:", err);
    }
  };

  /* ---------------------------------------------------------------- */
  /* 3D + AR handlers (START AWAY TIMER HERE)                         */
  /* ---------------------------------------------------------------- */
  const handleOpen3D = useCallback(() => {
    if (!product?.src) return;

    startAway();

    const url =
      `${window.location.origin}/3dviewer` +
      `?src=${encodeURIComponent(product.src)}` +
      `&name=${encodeURIComponent(product.product_name)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }, [product, startAway]);

  

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

      <div className="uppersection mt-20 pt-14">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-[50px] font-extrabold text-center text-primary-blue">
            {product.product_name}
          </h1>

          {mode === "2" ? (
            <div className="flex justify-center">
              <div className="mt-8 mb-12 w-[82%] max-w-md overflow-hidden rounded-2xl bg-[#E6E8EA] border border-[#D5D9DD] shadow-sm px-8 py-14">
                <div className="flex justify-center">
                  <button
                    onClick={handleOpen3D}
                    className="rounded-md bg-primary-blue px-8 py-4 text-lg font-semibold text-white hover:bg-gray-800"
                  >
                    Open 3D in new window
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="mt-8 mb-12 w-[82%] max-w-md overflow-hidden rounded-2xl bg-[#E6E8EA] border border-[#D5D9DD] shadow-sm px-8 py-14">
                <div className="flex flex-col items-center gap-4">
                  
                  <iframe
                    src={`https://ar-chair-viewer-a56s.vercel.app/?model=${encodeURIComponent(
                      product.sku
                    )}`}
                    title="AR Chair Viewer"
                    allow="xr-spatial-tracking; camera; microphone; fullscreen"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    loading="lazy"
                    //className="w-[350px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
          timeData={
            timeData ?? {
              productName: product.product_name,
              timeSpentInUpperSection: 0,
            }
          }
        />
      </div>

      <Footer />
    </section>
  );
};

export default SingleProduct;
