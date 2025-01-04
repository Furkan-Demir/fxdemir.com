function indexToTC(index) {
  if (index < 0 || index >= 900000000) {
      throw new Error("Index out of range. Must be between 0 and 899,999,999.");
  }

  // Map index to a base ID in the range [100000000, 999999999]
  const baseID = (index + 100000000).toString();

  // Split baseID into individual digits
  const numericIDArray = baseID.split("").map((char) => parseInt(char, 10));

  // Calculate the checksum digits
  let sumOddDigits = 0;
  let sumEvenDigits = 0;

  for (let i = 0; i < numericIDArray.length; i++) {
      if ((i + 1) % 2 === 0) {
          sumEvenDigits += numericIDArray[i];
      } else {
          sumOddDigits += numericIDArray[i];
      }
  }

  // Calculate 10th digit
  const tenthDigit = (sumOddDigits * 7 - sumEvenDigits) % 10;

  // Calculate 11th digit
  const totalSum = numericIDArray.reduce((acc, num) => acc + num, 0) + tenthDigit;
  const eleventhDigit = totalSum % 10;

  // Construct the full TC number
  return baseID + tenthDigit.toString() + eleventhDigit.toString();
}

function tcToIndex(tcNumber) {
  if (!validateID(tcNumber)) {
      throw new Error("Invalid TC number.");
  }

  // Extract the first 9 digits
  const baseID = tcNumber.substring(0, 9);

  // Convert to an index by subtracting the offset
  return parseInt(baseID, 10) - 100000000;
}

function validateID(idNumber) {
  if (idNumber.length !== 11 || !/^[0-9]+$/.test(idNumber) || idNumber.startsWith("0")) {
      return false;
  }

  const numericIDArray = idNumber.split("").map((char) => parseInt(char, 10));
  let sumOddDigits = 0;
  let sumEvenDigits = 0;

  for (let i = 0; i < 9; i++) {
      if ((i + 1) % 2 === 0) {
          sumEvenDigits += numericIDArray[i];
      } else {
          sumOddDigits += numericIDArray[i];
      }
  }

  const tenthDigit = parseInt(idNumber.charAt(9), 10);
  if (tenthDigit !== ((sumOddDigits * 7 - sumEvenDigits) % 10)) {
      return false;
  }

  const eleventhDigit = parseInt(idNumber.charAt(10), 10);
  const totalSum = numericIDArray.reduce((acc, num) => acc + num, 0);
  if (eleventhDigit !== ((totalSum - eleventhDigit) % 10)) {
      return false;
  }

  return true;
}

