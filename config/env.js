const Joi = require('joi');

const validateEnv = () => {
  const schema = Joi.object({
    PORT: Joi.number().default(5000),
    MONGODB_URI: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRE: Joi.string().default('7d'),
    OPENAI_API_KEY: Joi.string().required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  });

  const { error } = schema.validate(process.env);
  if (error) {
    throw new Error(`Environment validation error: ${error.details[0].message}`);
  }
};

module.exports = { validateEnv };
