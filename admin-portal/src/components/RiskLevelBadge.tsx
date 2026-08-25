export const getRiskLevel = (previousViolations: number) => {
  if (previousViolations === 0) {
    return {
      level: "LOW",
      title: "No Previous Violations",
      message: "This user has no other accepted reports.",
      className: "bg-green-50 border-green-200 text-green-700",
      iconClassName: "bg-green-100 text-green-600",
    };
  }

  if (previousViolations <= 2) {
    return {
      level: "MEDIUM",
      title: "Previous Violations",
      message: `This user has ${previousViolations} other ACCEPTED ${
        previousViolations === 1 ? "report" : "reports"
      }.`,
      className: "bg-yellow-50 border-yellow-200 text-yellow-700",
      iconClassName: "bg-yellow-100 text-yellow-600",
    };
  }

  return {
    level: "HIGH",
    title: "Repeat Offender",
    message: `This user has ${previousViolations} other ACCEPTED reports.`,
    className: "bg-red-50 border-red-200 text-red-700",
    iconClassName: "bg-red-100 text-red-600",
  };
};
