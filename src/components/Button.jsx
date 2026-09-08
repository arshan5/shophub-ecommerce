// Small wrapper around the .btn CSS classes for consistent buttons
// across the app (admin forms especially benefit from this).
export default function Button({
  children,
  variant = "primary",
  size = "",
  block = false,
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    size && `btn-${size}`,
    block && "btn-block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
