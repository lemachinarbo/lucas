/**
 * Logs a hello message and returns a greeting object.
 * @returns {Promise<Object>} An object containing the greeting message.
 */
export const getHello = async () => {
  console.log("hello");
  return { hello: "Hellooooo" };
};
