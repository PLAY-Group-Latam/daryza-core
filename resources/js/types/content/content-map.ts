import type {
    ModalContent, BannerDynamicContent, BrandsContent,
    ImagenPromocionalContent, ImagenesPromocionalesContent,
    AttributesContent, SectionTitlesContent,
    LogoContent, FooterContactContent, FooterSocialsContent,
    LegalEditorContent,
    BannerPromotionalContent, ImageFormContent, IntroAboutusContent,
    OurHistoryContent, OurPurposeContent, SustainabilityContent,
    BannerIndexContent, ImagePromotionalContent,
    ProductLite, GenericContent,
    ContactFormContent,
    DistributorNetworkContent,
    ContactGeneralContent,
} from './content-types';

export type SectionContentMap = {
    // HOME
    home_modal: ModalContent;
    home_banner: BannerDynamicContent;
    home_brands: BrandsContent;
    home_promo_image: ImagenPromocionalContent;
    home_promo_dynamic: ImagenesPromocionalesContent;
    home_attributes: AttributesContent;
    home_section_title: SectionTitlesContent;
    // FOOTER
    footer_logo_header: LogoContent;
    footer_logo_footer: LogoContent;
    footer_contact_info: FooterContactContent;
    footer_socials: FooterSocialsContent;
    // LEGALES
    tyc_editor: LegalEditorContent;
    anticorrupcion_editor: LegalEditorContent;
    libro_editor: LegalEditorContent;
    // ABOUTUS
    nosotros_banner: BannerPromotionalContent;
    nosotros_intro: IntroAboutusContent;
    nosotros_historia: OurHistoryContent;
    nosotros_proposito: OurPurposeContent;
    nosotros_sostenibilidad: SustainabilityContent;
    nosotros_formulario: ImageFormContent;
    // BLOG
    blog_banner: BannerIndexContent;
    blog_promos: ImagePromotionalContent;
    blog_products: { items: ProductLite[] };
    blog_post_promos: ImagePromotionalContent;
    //CONTACT

    // CONTACTOS
    contact_general: ContactGeneralContent;
    contact_service: ContactFormContent;
    contact_distributors: DistributorNetworkContent;
    contact_advisor: ContactFormContent;
    contact_help: ContactFormContent;
    contact_work: ContactFormContent;
};

export type SectionType = keyof SectionContentMap;

export type AnyContent = SectionContentMap[SectionType] | GenericContent;