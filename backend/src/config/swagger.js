import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Market API',
      version: '1.0.0',
      description: 'API documentation for Car Market application - A platform for buying and selling cars',
      contact: {
        name: 'API Support',
        email: 'support@carmarket.com',
      },
    },
    servers: [
      {
        url: `http://${HOST}:${PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.carmarket.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login/register endpoints',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            photo: {
              type: 'string',
              description: 'URL to user profile photo',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
            },
          },
        },
        Car: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Car ID',
            },
            brand: {
              type: 'string',
              description: 'Car brand',
            },
            model: {
              type: 'string',
              description: 'Car model',
            },
            year: {
              type: 'integer',
              description: 'Manufacturing year',
            },
            price: {
              type: 'number',
              description: 'Car price',
            },
            description: {
              type: 'string',
              description: 'Car description',
            },
            photo: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of car photo URLs',
            },
            userId: {
              type: 'integer',
              description: 'ID of the user who listed the car',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Order ID',
            },
            carId: {
              type: 'integer',
              description: 'ID of the car being ordered',
            },
            buyerId: {
              type: 'integer',
              description: 'ID of the buyer',
            },
            sellerId: {
              type: 'integer',
              description: 'ID of the seller',
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected'],
              description: 'Order status',
            },
          },
        },
        Favorite: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Favorite ID',
            },
            userId: {
              type: 'integer',
              description: 'User ID',
            },
            carId: {
              type: 'integer',
              description: 'Car ID',
            },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Conversation ID',
            },
            senderId: {
              type: 'integer',
              description: 'Sender user ID',
            },
            receiverId: {
              type: 'integer',
              description: 'Receiver user ID',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Message ID',
            },
            conversationId: {
              type: 'integer',
              description: 'Conversation ID',
            },
            senderId: {
              type: 'integer',
              description: 'Sender user ID',
            },
            text: {
              type: 'string',
              description: 'Message text',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            error: {
              type: 'string',
              description: 'Detailed error information',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/router/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
