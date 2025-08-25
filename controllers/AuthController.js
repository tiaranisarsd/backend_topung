import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import argon2 from "argon2";

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || "your-secret-key";

async function generateAndStoreToken(user) {
  const token = jwt.sign({ id: user.id, role: user.role }, secretKey, {
    expiresIn: "1h"
  });
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.token.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
      revoked: false
    },
  });

  return token;
}

export const Login = async (req, res) => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const match = await argon2.verify(user.password, req.body.password);

    if (!match) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    const token = await generateAndStoreToken(user);

    const { id, nama, email, role } = user;
    res.status(200).json({ id, nama, email, role, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Login failed", error });
  }
};

export const Me = async (req, res) => {
  try {
    const userId = req.user.id;

    const tokenData = await prisma.token.findFirst({
      where: {
        token: req.headers.authorization.split(" ")[1],
        userId: Number(userId),
        revoked: false,
        expiresAt: {
          gt: new Date(), 
        },
      },
    });

    if (!tokenData) {
      return res.status(401).json({ msg: "Invalid or Expired Token" });
    }
    const response = await prisma.users.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
      },
    });

    if (!response) return res.status(404).json({ msg: "User not found" });

    res.status(200).json(response);
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ msg: "Failed to retrieve user data", error });
  }
};

export const logOut = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ msg: "Token tidak ditemukan" }); 
    }

    try {
      await prisma.token.delete({
        where: {
          token: token,
        },
      });
      res.status(200).json({ msg: "Logout successful" }); 
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(401).json({ msg: "Invalid or Expired Token" });
      }

      console.error("Error during logout:", error);
      res.status(500).json({ msg: "Logout Failed", error }); 
    }
  } catch (error) {
    console.error("Error during logout process:", error);
    res.status(500).json({ msg: "Logout Failed", error });
  }
};

