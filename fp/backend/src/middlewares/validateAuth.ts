import { Request, Response, NextFunction } from "express";
import { AuthValidator } from "../api-wrapper/validators/AuthValidator";

export const validateLoginInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const inputValidation = AuthValidator.validateLoginInput({
    email: req.body.email,
    password: req.body.password ,
  });

  if (!inputValidation.valid) {
    return res.status(400).json({
      error: "Validation Error",
      description: inputValidation.errors?.join(", ") || "Invalid input",
    });
  }

  next();
};

export const validateRegisterInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const inputValidation = AuthValidator.validateRegisterInput(req.body);

  if (!inputValidation.valid) {
    return res.status(400).json({
      error: "Validation Error",
      description: inputValidation.errors?.join(", ") || "Invalid input",
    });
  }

  next();
};
