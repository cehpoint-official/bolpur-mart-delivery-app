type Props = {
  status: "PENDING" | "PICKED" | "ON_THE_WAY" | "DELIVERED";
};

export default function OrderStatusBadge({ status }: Props) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-500",
    PICKED: "bg-blue-500",
    ON_THE_WAY: "bg-purple-500",
    DELIVERED: "bg-green-600",
  };

  return (
    <span
      className={`px-2 py-1 text-xs text-white rounded ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
