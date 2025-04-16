export const validateEditProfileData = (req) => {
  const allowedEditData = [
    "firstName",
    "lastName",
    "gender",
    "age",
    "about",
    "skills",
    "photoUrl",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditData.includes(field)
  );
  return isEditAllowed;
};
