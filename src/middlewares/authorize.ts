import { Request, Response, NextFunction } from "express";

/**
 * Usage: router.get("/admin", authenticate, authorize("admin"), handler)
 * Accepts one or more roles: authorize("admin", "vendor")
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do this" });
    }
    next();
  };
};
