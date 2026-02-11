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

  // ------------------------------
// AWAY TIME (product-aware)
// ------------------------------
const AWAY_CTX_KEY = "singleProduct_awayCtx"; // JSON: { productId, productName, startedAt }
const AWAY_TOTAL_ALL_KEY = "singleProduct_awayTotalSeconds_all";

const getAwayTotalKeyForProduct = (productName: string) =>
  `singleProduct_awayTotalSeconds_${productName}`;

const startAway = useCallback(() => {
  if (!product) return;

  // don't overwrite if already running
  if (sessionStorage.getItem(AWAY_CTX_KEY)) return;

  sessionStorage.setItem(
    AWAY_CTX_KEY,
    JSON.stringify({
      productId: product.id,
      productName: product.product_name,
      startedAt: Date.now(),
    })
  );
}, [product]);

const stopAwayAndAccumulate = useCallback(() => {
  const raw = sessionStorage.getItem(AWAY_CTX_KEY);
  if (!raw) return;

  let ctx: { productId: number; productName: string; startedAt: number } | null =
    null;

  try {
    ctx = JSON.parse(raw);
  } catch {
    ctx = null;
  }
  if (!ctx?.startedAt || !ctx.productName) {
    sessionStorage.removeItem(AWAY_CTX_KEY);
    return;
  }

  const deltaSec = (Date.now() - ctx.startedAt) / 1000;

  // 1) per-product total
  const perKey = getAwayTotalKeyForProduct(ctx.productName);
  const prevPer = Number(sessionStorage.getItem(perKey) ?? "0");
  sessionStorage.setItem(perKey, String(prevPer + deltaSec));

  // 2) total across products
  const prevAll = Number(sessionStorage.getItem(AWAY_TOTAL_ALL_KEY) ?? "0");
  sessionStorage.setItem(AWAY_TOTAL_ALL_KEY, String(prevAll + deltaSec));

  // stop timer
  sessionStorage.removeItem(AWAY_CTX_KEY);
}, []);


  /* ---------- version flag ---------- */
  const version = useMemo(() => {
    const seen = sessionStorage.getItem("productdetailsVersion");
    const order = sessionStorage.getItem("shuffledIDs");
    if (!seen || !order || !product) return undefined;

    const seenArr = JSON.parse(seen) as (boolean | null | undefined)[];
    const orderArr = JSON.parse(order) as (number | string)[];
    const idx = orderArr.map(String).indexOf(String(product.id));
  return idx > -1 ? (seenArr[idx] ?? undefined) : undefined;
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

  const get3DViewerUrl = useCallback(() => {
    if (!product?.src) return "";
  
    return (
      `${window.location.origin}/3dviewer` +
      `?src=${encodeURIComponent(product.src)}` +
      `&name=${encodeURIComponent(product.product_name)}`
    );
  }, [product]);
  
  /* ---------------------------------------------------------------- */
  /* 3D Launcher with iframe                                                       */
  /* ---------------------------------------------------------------- */

  const build3DLauncherSrcDoc = useCallback((url: string) => {
    // JSON.stringify safely quotes/escapes the URL for inline JS
    return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>
        html, body { height: 100%; margin: 0; }
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E6E8EA;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        }
        button {
          border: 0;
          border-radius: 8px;
          padding: 22px 24px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: #364F6B; /* close to your primary-blue */
          cursor: pointer;
        }
        button:hover { filter: brightness(0.9); }
      </style>
    </head>
    <body>
      <button id="btn">Open 3D in new window</button>
      <script>
        document.getElementById('btn').addEventListener('click', function () {
          window.open(${JSON.stringify(url)}, '_blank', 'noopener,noreferrer');
        });
      </script>
    </body>
  </html>`;
  }, []);
  

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
            <div className="mt-8 mb-12 w-[82%] max-w-md overflow-hidden rounded-2xl bg-[#E6E8EA] border border-[#D5D9DD] shadow-sm h-[240px]">
              <iframe
                title="Open 3D Launcher"
                srcDoc={build3DLauncherSrcDoc(get3DViewerUrl())}
                className="w-full h-full"
                onMouseDown={() => startAway()} 
              />
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
                    className="w-full h-[130px]"
                    //className="w-[350px] h-[130px]"
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
