interface Props {
  error?: Error | null;
}

export default function LoadingError({ error }: Props) {
  if (!error) return null;
  return <p>{error.message}</p>; // TODO
}
