const calculateValues = (formData: any) => {
  const bruto = parseFloat(formData.bruto_kg) || 0;
  const tare = parseFloat(formData.tare_kg) || 0;
  const potPercentage = parseFloat(formData.pot_percentage) || 0;
  const hargaPerKg = parseFloat(formData.harga_per_kg) || 0;

  const netto = bruto - tare;
  const potKg = (netto * potPercentage) / 100;
  const total = netto - potKg;
  const totalHarga = total * hargaPerKg;

  return {
    netto_kg: Math.max(0, netto),
    pot_kg: potKg,
    total_kg: Math.max(0, total),
    total_harga: Math.max(0, totalHarga),
  };
};

const testCalculation = () => {
  const formData = {
    bruto_kg: "1500",
    tare_kg: "1000",
    pot_percentage: "3",
    harga_per_kg: "1000",
  };

  const result = calculateValues(formData);

  console.assert(result.netto_kg === 500, "Netto calculation is incorrect");
  console.assert(result.pot_kg === 15, "Pot_kg calculation is incorrect");
  console.assert(result.total_kg === 485, "Total kg calculation is incorrect");
  console.assert(result.total_harga === 485000, "Total harga calculation is incorrect");

  console.log("All calculation tests passed!");
};

testCalculation();
