import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || "your-secret-key";

export const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: "Mohon login ke akun Anda (Token tidak ada)" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token tidak valid atau kadaluarsa" });
  }
};

export const ownerOnly = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: "Mohon login ke akun Anda (Token tidak ada)" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    if (decoded.role !== "owner") {
      return res.status(403).json({ msg: "Akses terlarang" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token tidak valid atau kadaluarsa" });
  }
};
