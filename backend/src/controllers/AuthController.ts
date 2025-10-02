import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, phone } = req.body;

      const userRepository = AppDataSource.getRepository(User);

      // Verificar si ya existe
      const existing = await userRepository.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = userRepository.create({
        username,
        email,
        phone,
        password: hashedPassword,
      });

      await userRepository.save(newUser);

      return res.status(201).json({ message: "Usuario creado", user: newUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Generar JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "1h" }
      );

      return res.json({ message: "Login exitoso", token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error en login" });
    }
  }
}
