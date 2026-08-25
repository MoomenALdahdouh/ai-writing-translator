type Props = {
  size?: number
}

export function Mark({ size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#0D9488" />
      <path
        d="M8 12.5h6.5M8 19.5h6.5M11.25 12.5v7"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M17.5 16h6.2"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M21.4 12.8 25.2 16l-3.8 3.2"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
