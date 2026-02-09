/* Thankyoupage.tsx */
import React, { useEffect } from "react";
import Footer from "../Components/Footer";
import { doc, setDoc } from "@firebase/firestore";
import { db } from "../services/firebase";

const useQuery = () => new URLSearchParams(window.location.search);

const ThankYouPage: React.FC = () => {
  const params = useQuery();
  const userId = params.get("userId");
  const mode = params.get("mode");
  const version = params.get("isV");

  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, "users", userId);

    const data: Record<string, unknown> = {};
    let totalSingle = 0;
    let totalDetails = 0;

    // Treat only these keys as numeric "time" keys.
    const isTimeKey = (key: string) =>
      key.startsWith("timeSpentOnSingleProductPage") ||
      key.startsWith("timeSpentOnProductDetailsPage") ||
      key === "timeSpentOnHomePage" ||
      key === "singleProduct_awayTotalSeconds" || // if you used this name
      key === "singleProduct_awayTotalSeconds" ||
      key === "singleProduct_awayTotalSeconds";

    // If you used a different away key in your latest code, add it here too.
    const isAlsoTimeKey = (key: string) =>
      isTimeKey(key) ||
      key === "singleProduct_awayTotalSeconds" ||
      key === "singleProduct_awayTotalSeconds";

    Object.keys(sessionStorage).forEach((key) => {
      const raw = sessionStorage.getItem(key);

      if (isAlsoTimeKey(key)) {
        const val = Number(raw ?? "0") || 0;

        if (key.startsWith("timeSpentOnSingleProductPage")) totalSingle += val;
        if (key.startsWith("timeSpentOnProductDetailsPage")) totalDetails += val;

        data[key] = val;
      } else {
        // Keep non-time keys (arrays/booleans/strings) as-is.
        // Try JSON.parse first so shuffledIDs / productdetailsVersion
        // become proper arrays in Firestore.
        if (raw === null) {
          data[key] = null;
        } else {
          try {
            data[key] = JSON.parse(raw);
          } catch {
            data[key] = raw;
          }
        }
      }
    });

    data.totalTimeSpentOnSingleProductPage = totalSingle;
    if (totalDetails > 0) data.totalTimeSpentOnProductDetailsPage = totalDetails;

    // Store URL params too (optional but helpful)
    data.mode = mode ?? null;
    data.isV = version ?? null;

    setDoc(ref, data, { merge: true })
      .catch((err) => console.error("Firestore write error:", err))
      .finally(() => sessionStorage.clear());
  }, [userId, mode, version]);

  const getSurveyLink = (): string | null => {
    const map: Record<string, Record<string, string>> = {
      "1": {
        true: "https://unikoelnwiso.eu.qualtrics.com/jfe/form/SV_9KqiwjwTldUzzTg",
        false: "https://unikoelnwiso.eu.qualtrics.com/jfe/form/SV_6MapWG93aPGf6vk",
      },
      "2": {
        true: "https://unikoelnwiso.eu.qualtrics.com/jfe/form/SV_8B9rcM6t3RSO3Fc",
        false: "https://unikoelnwiso.eu.qualtrics.com/jfe/form/SV_dbPKlLmNV1dv7AG",
      },
    };

    return mode && version ? map[mode]?.[version as "true" | "false"] ?? null : null;
  };

  return (
    <div className="pb-32">
      <div className="h-20 w-full bg-secondary" />

      <section className="mb-40 text-center mt-10">
        <h2 className="text-[95px] text-primary-blue mt-[8rem] font-semibold mb-8">
          Thank You.
        </h2>

        {getSurveyLink() && (
          <h3 className="text-[30px]">
            Now,&nbsp;
            <a href={getSurveyLink()!} className="underline text-primary-blue">
              please follow this link to return to the survey.
            </a>
          </h3>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ThankYouPage;
