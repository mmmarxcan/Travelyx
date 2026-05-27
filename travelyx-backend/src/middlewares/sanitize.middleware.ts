import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    // Escapar etiquetas HTML y scripts
    return sanitizeHtml(value, {
      allowedTags: [], // No permitimos ninguna etiqueta HTML (modo texto plano estricto)
      allowedAttributes: {}
    });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: any = {};
    for (const key in value) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }
  return value;
};

export const globalSanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};
