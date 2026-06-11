const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not allowed to access this resource` 
      });
    }
    next();
  };
};

const authorizePermissions = (...permissionCodes) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role: userRole },
        include: { permission: true }
      });

      const userPermissionCodes = rolePermissions.map(rp => rp.permission.code);
      
      const hasPermission = permissionCodes.every(code => userPermissionCodes.includes(code));

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Permission denied. Required: [${permissionCodes.join(', ')}]` 
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking permissions', error: error.message });
    }
  };
};

module.exports = { authenticateUser, authorizeRoles, authorizePermissions };
