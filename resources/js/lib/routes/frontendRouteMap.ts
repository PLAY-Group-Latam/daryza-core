const FRONTEND_BASE = import.meta.env.VITE_FRONTEND_URL;

export const FRONTEND_ROUTE_MAP: Record<string, (slug?: string) => string> = {
  // Home
  home_modal: () => `${FRONTEND_BASE}/`,
  home_banner: () => `${FRONTEND_BASE}/`,
  home_brands: () => `${FRONTEND_BASE}/`,
  home_promo_image: () => `${FRONTEND_BASE}/`,
  home_promo_dynamic: () => `${FRONTEND_BASE}/`,
  home_attributes: () => `${FRONTEND_BASE}/`,
  home_section_title: () => `${FRONTEND_BASE}/`,

  // Footer (también vive en home)
  footer_logo_header: () => `${FRONTEND_BASE}/`,
  footer_logo_footer: () => `${FRONTEND_BASE}/`,
  footer_contact_info: () => `${FRONTEND_BASE}/`,
  footer_socials: () => `${FRONTEND_BASE}/`,

  // Legales
  tyc_editor: () => `${FRONTEND_BASE}/terminos-y-condiciones`,
  anticorrupcion_editor: () => `${FRONTEND_BASE}/politica-de-privacidad`,
  libro_editor: () => `${FRONTEND_BASE}/libro-de-reclamaciones`,

  // Contacto
  contact_general: () => `${FRONTEND_BASE}/contacto`,
  contact_help: () => `${FRONTEND_BASE}/contacto/centro-de-ayuda`,
  contact_service: () => `${FRONTEND_BASE}/contacto/servicio-cliente`,
  contact_distributors: () => `${FRONTEND_BASE}/contacto/red-comercial`,
  contact_advisor: () => `${FRONTEND_BASE}/contacto/asesoria`,
  contact_work: () => `${FRONTEND_BASE}/trabajos`,

  // Nosotros
  nosotros_banner: () => `${FRONTEND_BASE}/nosotros`,
  nosotros_intro: () => `${FRONTEND_BASE}/nosotros`,
  nosotros_historia: () => `${FRONTEND_BASE}/nosotros`,
  nosotros_proposito: () => `${FRONTEND_BASE}/nosotros`,
  nosotros_sostenibilidad: () => `${FRONTEND_BASE}/nosotros`,
  nosotros_formulario: () => `${FRONTEND_BASE}/nosotros`,

  // Blog
  blog_banner: () => `${FRONTEND_BASE}/blog`,
  blog_promos: () => `${FRONTEND_BASE}/blog`,
  blog_products: () => `${FRONTEND_BASE}/blog`,
  blog_post_promos: () => `${FRONTEND_BASE}/blog`,

  // Sistema
  sistema_perfil: () => `${FRONTEND_BASE}/pedidos`,
  sistema_checkout: () => `${FRONTEND_BASE}/checkout`,
  sistema_carrito: () => `${FRONTEND_BASE}/carrito`,
  sistema_filtrado: () => `${FRONTEND_BASE}/productos`,

  // Producto dinámico
  sistema_producto: (slug?: string) =>
    slug
      ? `${FRONTEND_BASE}/producto/${slug}`
      : `${FRONTEND_BASE}/productos`,
};