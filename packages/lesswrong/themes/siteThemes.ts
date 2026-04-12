import { ForumTypeString } from '@/lib/instanceSettings';

export const lessWrongTheme: SiteThemeSpecification = {
  componentPalette: (dark: boolean) => ({
  }),
  make: (palette: ThemePalette) => ({
    isLW: true,
    isAF: false,
  }),
};
export const alignmentForumTheme: SiteThemeSpecification = {
  componentPalette: (dark: boolean) => ({
  }),
  make: (palette: ThemePalette) => ({
    isLW: false,
    isAF: true,
  }),
};

const unresignedSans =
  '"DM Sans", "Gill Sans Nova", "Gill Sans", "Gill Sans MT", Calibri, "Helvetica Neue", Helvetica, Arial, sans-serif';
const unresignedSerif =
  '"Spectral", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif';
const unresignedHeader =
  '"Fraunces", "Spectral", "Palatino Linotype", Palatino, Georgia, serif';

export const unresignedTheme: SiteThemeSpecification = {
  componentPalette: () => ({
    fonts: {
      sansSerifStack: unresignedSans,
      serifStack: unresignedSerif,
      headerStack: unresignedHeader,
    },
    link: {
      color: "light-dark(#1A535C,#6ec4cf)",
      visited: "light-dark(#0d3d44,#8fd4dc)",
      primaryDim: "light-dark(#2d6f78,#4a9aa8)",
    },
    icon: {
      sprout: "#1A535C",
      recentDiscussionGreen: "#1A535C",
    },
    background: {
      default: "light-dark(#f7f5f0,#262626)",
      hover: "light-dark(#ebe8e0,#333)",
    },
  }),
  make: (palette: ThemePalette) => ({
    isLW: true,
    isAF: false,
    typography: {
      cloudinaryFont: {
        stack: "'Spectral', serif",
        url: "https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;1,400&display=swap",
      },
      title: {
        fontSize: 20,
        fontWeight: 600,
        letterSpacing: "-0.03em",
      },
    },
  }),
};

export const getSiteTheme = (forumType: ForumTypeString): SiteThemeSpecification => {
  if (forumType === 'AlignmentForum') return alignmentForumTheme;
  if (forumType === 'Unresigned') return unresignedTheme;
  else return lessWrongTheme;
}
