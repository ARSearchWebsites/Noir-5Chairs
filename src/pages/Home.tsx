import React, { useEffect, useRef } from "react";
import HeroSection from "../Components/LandingPage";
import ProductList from "../Components/ProductList";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

interface HomeProps {
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const Home: React.FC<HomeProps> = ({ forwardedRef }) => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("userId") ?? "";

  // Use refs so we don't trigger effect re-runs and we avoid the "pageStart = 0" cleanup bug.
  const pageStartRef = useRef<number>(0);
  const initialRef = useRef<number>(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Read previous accumulated time (if any)
    initialRef.current = Number(sessionStorage.getItem("timeSpentOnHomePage") ?? "0") || 0;

    // Mark page enter time
    pageStartRef.current = Date.now();

    // Only write on unmount
    return () => {
      const elapsed = (Date.now() - pageStartRef.current) / 1_000;
      const total = initialRef.current + elapsed;

      sessionStorage.setItem("timeSpentOnHomePage", String(total));
    };
  }, []);

  return (
    <>
      <Header />

      <HeroSection userId={userId} />

      <div className="pcontainer">
        <ProductList userId={userId} forwardedRef={forwardedRef} />
      </div>

      <Footer />
    </>
  );
};

export default Home;
