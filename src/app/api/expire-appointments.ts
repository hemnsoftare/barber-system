import { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const now = new Date();

  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
  const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);

  try {
    const snapshot = await db
      .collection("appointments")
      .where("status", "==", "not-finished")
      .where("date", ">=", startTimestamp)
      .where("date", "<=", endTimestamp)
      .get();

    if (snapshot.empty) {
      return res
        .status(200)
        .json({ message: "No appointments to expire for today." });
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "expired",
        expiredAt: admin.firestore.Timestamp.now(),
      });
    });

    await batch.commit();

    return res
      .status(200)
      .json({ message: `Expired ${snapshot.size} appointments.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to expire appointments" });
  }
}
