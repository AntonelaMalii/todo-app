export async function getServerSideProps() {
  return { redirect: { destination: '/chat', permanent: false } };
}

export default function Home() {
  return null;
}
