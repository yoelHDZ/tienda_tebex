import { Container } from "@mantine/core";

export const metadata = {
  title: "Admin Panel",
  description: "Manage store settings, content and blog posts.",
};

export default function AdminLayout({ children }) {
  return (
    <Container my="xl" size={1400}>
      {children}
    </Container>
  );
}

