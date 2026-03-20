const Joi = require('joi');

const validateEnv = () => {
  const schema = Joi.object({
    PORT: Joi.number().default(5000),
    MONGODB_URI: Joi.string().required(),
    GEMINI_API_KEY: Joi.string().required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  });

  const { error } = schema.validate(process.env, { allowUnknown: true });
  if (error) {
    throw new Error(`Environment validation error: ${error.details[0].message}`);
  }
};

module.exports = { validateEnv };
