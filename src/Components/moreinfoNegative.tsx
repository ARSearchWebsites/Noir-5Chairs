import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import SecondHeader from './SecondHeader';
import Footer from './Footer';
import data from '../data/product_data';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import { doc, setDoc, arrayUnion } from '@firebase/firestore';
import { db } from '../services/firebase';
import { Product } from '../types/types';

const MoreinfoPositive: React.FC = () => {
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.href, title: 'MoreInfo Page' });
  }, []);

  const params   = new URLSearchParams(window.location.search);
  const product  = data.find(
    (p: Product) => String(p.id) === params.get('product_id')
  ) ?? null;

  const userId   = params.get('userId') ?? '';
  const version  = params.get('isV');

  const [open, setOpen] = useState({
    material: false,
    backrest: false,
    seat:     false,
    safety:   false,
  });

  const toggle = (key: keyof typeof open) =>
    setOpen((s) => ({ ...s, [key]: !s[key] }));

  const logBuyNow = async (payload: string) =>
    setDoc(doc(db, 'users', userId), { 'Clicked Jetzt Kaufen': arrayUnion(payload) }, { merge: true });

  const logFeature = async (feature: string) =>
    setDoc(
      doc(db, 'users', userId),
      { 'Clicked Feature': arrayUnion(`${feature} ${new Date().toISOString()}`) },
      { merge: true }
    );

  if (!product) return <div>Loading…</div>;

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <SecondHeader
          userId={userId}
          product_id={params.get('product_id') ?? ''}
          version={version ?? undefined}
          onClickJetztKaufen={logBuyNow}
          timeData={{}}
        />
      </div>

      <main id="top" className="mt-20 px-10 mb-10 flex flex-col items-center text-center">
        <h1 className="text-primary-blue text-[32px] font-bold my-8">Product Details</h1>

        <FeatureBlock
          title="Material: Plastic"
          open={open.material}
          toggle={() => { toggle('material'); logFeature('Material'); }}
        >
          The {product.product_name} is made from standard plastic.
        </FeatureBlock>

        <FeatureBlock
          title="Backrest: No reclining function"
          open={open.backrest}
          toggle={() => { toggle('backrest'); logFeature('Backrest'); }}
        >
          The {product.product_name} does not offer a reclining backrest.
        </FeatureBlock>

        <FeatureBlock
          title="Adjustable Seat Height: Not included"
          open={open.seat}
          toggle={() => { toggle('seat'); logFeature('Adjustable Seat Height'); }}
        >
          The {product.product_name} does not offer adjustable seat height.
        </FeatureBlock>

        <FeatureBlock
          title="Safety Feature: Not included"
          open={open.safety}
          toggle={() => { toggle('safety'); logFeature('Safety Feature'); }}
        >
          The {product.product_name} does not include a safety mechanism (e.g., wheel lock).
        </FeatureBlock>
      </main>

      <Footer />
    </>
  );
};

export default MoreinfoPositive;

interface FeatureProps { title: string; open: boolean; toggle: () => void; children: React.ReactNode; }

const FeatureBlock: React.FC<FeatureProps> = ({ title, open, toggle, children }) => {
  return (
    <div className="w-full max-w-2xl py-4">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-start justify-between gap-4 text-left text-primary-blue text-xl font-semibold"
      >
        {/* Title grows naturally */}
        <span className="flex-1 text-center leading-snug">
          {title}
        </span>

        {/* Fixed icon container */}
        <span className="shrink-0 pt-1">
          {open ? <AiOutlineUp size={22} /> : <AiOutlineDown size={22} />}
        </span>
      </button>

      <p className={`${open ? 'block mt-3' : 'hidden'} text-black text-lg`}>
        {children}
      </p>
    </div>
  );
};
