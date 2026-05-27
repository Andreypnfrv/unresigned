import React, { FC } from 'react';
import Button from '@/lib/vendor/@material-ui/core/src/Button';
import ImageIcon from '@/lib/vendor/@material-ui/icons/src/Image';
import classNames from 'classnames';
import { useDialog } from '../common/withDialog';
import { useCurrentUser } from '../common/withUser';
import { userHasDefaultProfilePhotos } from '../../lib/betas';
import { ImageType, POST_HEADER_EVENT_BANNER_RATIO, useImageUpload } from '../hooks/useImageUpload';
import { isFriendlyUI } from '../../themes/forumTheme';
import { useQuery } from "@/lib/crud/useQuery";
import { gql } from "@/lib/generated/gql-codegen";
import { defineStyles, useStyles } from '../hooks/useStyles';
import { TypedFieldApi } from '@/components/tanstack-form-components/BaseAppForm';
import UsersProfileImage from "../users/UsersProfileImage";
import CloudinaryImage2 from "../common/CloudinaryImage2";
import ImageUploadDefaultsDialog from "./ImageUploadDefaultsDialog";


const UsersMinimumInfoQuery = gql(`
  query ImageUpload($documentId: String) {
    user(input: { selector: { documentId: $documentId } }) {
      result {
        ...UsersMinimumInfo
      }
    }
  }
`);

const styles = defineStyles('ImageUpload', (theme: ThemeType) => ({
  root: {
    paddingTop: 4,
    marginLeft: 8,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  },
  imgVertical: {
    flexBasis: "100%",
  },
  buttons: {
    display: "flex",
  },
  buttonsHorizontal: {
    gap: "10px",
    height: 56,
  },
  buttonsVertical: {
    flexDirection: "column",
    marginLeft: 10,
  },
  button: {
    background: theme.palette.buttons.imageUpload.background,
    "&:hover": {
      background: theme.palette.buttons.imageUpload.hoverBackground,
    },
    color: theme.palette.text.invertedBackgroundText,
  },
  profileImageButton: {
    margin: "10px 0",
    fontSize: 14,
    fontWeight: 500,
    textTransform: "none",
    background: theme.palette.primary.main,
    color: theme.palette.text.alwaysWhite, // Dark mode independent
    "&:hover": {
      background: theme.palette.primary.light,
    },
  },
  profileImageButtonVertical: {
    marginBottom: 4,
  },
  imageIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  removeButton: {
    color: theme.palette.icon.dim,
  },
  removeProfileImageButton: {
    textTransform: "none",
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.primary.main,
    justifyContent: "flex-start",
    padding: 0,
    "&:hover": {
      color: theme.palette.primary.dark,
      background: "transparent",
    },
    "& .MuiButton-label": {
      alignItems: "flex-start",
    },
  },
  postHeaderEditorRoot: {
    width: "100%",
    marginLeft: 0,
    paddingTop: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  postHeaderPreviewSlot: {
    width: "100%",
    borderRadius: theme.borderRadius.small,
    overflow: "hidden",
    border: theme.palette.greyBorder("1px", 0.14),
    backgroundColor: theme.palette.greyAlpha(0.04),
  },
  postHeaderPicture: {
    width: "100%",
    display: "block",
  },
  postHeaderPlaceholder: {
    width: "100%",
    aspectRatio: "5 / 2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...theme.typography.smallText,
    color: theme.palette.text.dim3,
  },
  postHeaderActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
}));

export const formPreviewSizeByImageType: Record<
  ImageType,
  { width: number | "auto"; height: number; imgProps?: any }
> = {
  gridImageId: { width: 250, height: 100 },
  bannerImageId: { width: 1600, height: 380, imgProps: { g: 'custom', dpr: '2.0' } },
  squareImageId: { width: 90, height: 90 },
  profileImageId: { width: 90, height: 90 },
  socialPreviewImageId: { width: 153, height: 80 },
  eventImageId: { width: 373, height: 195 },
  spotlightImageId: { width: 345, height: 234 },
  spotlightDarkImageId: { width: 345, height: 234 },
  onsiteDigestImageId: { width: 200, height: 300 },
}

const FormProfileImage: FC<{
  document?: Partial<UsersMinimumInfo>,
  profileImageId: string,
  size: number,
}> = ({document, profileImageId, size}) => {
  const { data } = useQuery(UsersMinimumInfoQuery, {
    variables: { documentId: document?._id },
    fetchPolicy: "cache-and-network",
  });
  const user = data?.user?.result;
  return (
    <UsersProfileImage
      user={user ? {...user, profileImageId} : undefined}
      size={size}
    />
  );
}

const TriggerButton: FC<{
  imageType: ImageType,
  imageId?: string,
  uploadImage: () => void,
  label?: string,
  horizontal?: boolean,
}> = ({imageType, imageId, uploadImage, label, horizontal}) => {
  const classes = useStyles(styles);
  let mainClass = classes.button;
  let showIcon = true;
  return (
    <Button
      onClick={uploadImage}
      className={classNames(
        "image-upload-button",
        mainClass,
        horizontal && classes.profileImageButtonVertical,
      )}
    >
      {showIcon && <ImageIcon className={classes.imageIcon} />}
      {imageId ? `Replace ${label}` : `Upload ${label}`}
    </Button>
  );
}

const RemoveButton: FC<{
  imageType: ImageType,
  imageId?: string,
  removeImage: () => void,
}> = ({imageType, imageId, removeImage}) => {
  const classes = useStyles(styles);
  if (!imageId) {
    return null;
  }

  const mainClass = isFriendlyUI() && imageType === "profileImageId"
    ? classes.removeProfileImageButton
    : classes.removeButton;
  return (
    <Button
      title="Remove"
      onClick={removeImage}
      className={classNames("image-remove-button", mainClass)}
    >
      Remove
    </Button>
  );
}

interface ImageUploadProps {
  field: TypedFieldApi<string | null | undefined>;
  document?: Partial<UsersMinimumInfo>;
  label?: string;
  croppingAspectRatio?: number;
  horizontal?: boolean;
  /** Full-width stacked preview + actions (post edit header hero). */
  variant?: "default" | "postHeaderEditor";
  onImageIdChange?: (imageId: string | null) => void;
}


export const ImageUpload = ({
  field,
  document,
  label,
  croppingAspectRatio,
  horizontal = false,
  variant = "default",
  onImageIdChange,
}: ImageUploadProps) => {
  const classes = useStyles(styles);
  const imageType = field.name as ImageType;
  const currentUser = useCurrentUser();
  const resolvedPostHeaderCropRatio =
    variant === "postHeaderEditor" && imageType === "eventImageId"
      ? POST_HEADER_EVENT_BANNER_RATIO
      : undefined;
  const {uploadImage} = useImageUpload({
    imageType,
    onUploadSuccess: (publicImageId: string) => {
      field.handleChange(publicImageId);
      onImageIdChange?.(publicImageId);
    },
    onUploadError: (error: Error) => {
      // eslint-disable-next-line no-console
      console.error("Image Upload failed:", error);
    },
    croppingAspectRatio: croppingAspectRatio ?? resolvedPostHeaderCropRatio,
  });

  const { openDialog } = useDialog();
  const imageId = field.state.value || '';

  const removeImg = () => {
    field.handleChange(null);
    onImageIdChange?.(null);
  };

  const formPreviewSize = formPreviewSizeByImageType[imageType];
  if (!formPreviewSize) throw new Error("Unsupported image upload type")

  const showUserProfileImage = isFriendlyUI() && imageType === "profileImageId";

  if (variant === "postHeaderEditor") {
    return (
      <div className={classes.postHeaderEditorRoot}>
        <div className={classes.postHeaderPreviewSlot}>
          {showUserProfileImage ? (
            <FormProfileImage
              document={document}
              profileImageId={imageId}
              size={formPreviewSize.height}
            />
          ) : imageId ? (
            <CloudinaryImage2
              publicId={imageId}
              fullWidthHeader
              preserveUploadedAspectRatio
              imgProps={{ q: "auto:good", g: "center" }}
              wrapperClassName={classes.postHeaderPicture}
              className={classes.postHeaderPicture}
            />
          ) : (
            <div className={classes.postHeaderPlaceholder}>No header image yet</div>
          )}
        </div>
        <div className={classes.postHeaderActions}>
          <TriggerButton
            imageType={imageType}
            imageId={imageId}
            uploadImage={uploadImage}
            label={label}
            horizontal={horizontal}
          />
          {imageType === "eventImageId" && (
            <Button
              variant="outlined"
              onClick={() =>
                openDialog({
                  name: "ImageUploadDefaultsDialog",
                  contents: ({ onClose }) => (
                    <ImageUploadDefaultsDialog onClose={onClose} onSelect={(id: string) => {
                      field.handleChange(id);
                      onImageIdChange?.(id);
                    }} />
                  ),
                })
              }
            >
              Choose from ours
            </Button>
          )}
          <RemoveButton imageType={imageType} imageId={imageId} removeImage={removeImg} />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classNames(!horizontal && classes.imgVertical)}>
        {showUserProfileImage &&
          <FormProfileImage
            document={document}
            profileImageId={imageId}
            size={formPreviewSize.height}
          />
        }
        {imageId && !showUserProfileImage &&
          <CloudinaryImage2
            publicId={imageId}
            {...formPreviewSize}
          />
        }
      </div>
      <div className={classNames(
        classes.buttons,
        !horizontal && classes.buttonsHorizontal,
        horizontal && classes.buttonsVertical,
      )}>
        <TriggerButton
          imageType={imageType}
          imageId={imageId}
          uploadImage={uploadImage}
          label={label}
          horizontal={horizontal}
        />
        {(imageType === 'eventImageId') && <Button
          variant="outlined"
          onClick={() => openDialog({
            name: "ImageUploadDefaultsDialog",
            contents: ({onClose}) => <ImageUploadDefaultsDialog onClose={onClose} onSelect={(id: string) => {
              field.handleChange(id);
              onImageIdChange?.(id);
            }} />
          })}
        >
          Choose from ours
        </Button>}
        {userHasDefaultProfilePhotos(currentUser) && imageType === 'profileImageId' &&
          <Button
            variant="outlined"
            onClick={() => openDialog({
              name: "ImageUploadDefaultsDialog",
              contents: ({onClose}) => <ImageUploadDefaultsDialog
                onClose={onClose}
                onSelect={(id: string) => field.handleChange(id)}
                type={"Profile"}
              />
            })}
          >
            Choose from ours
          </Button>
        }
        <RemoveButton
          imageType={imageType}
          imageId={imageId}
          removeImage={removeImg}
        />
      </div>
    </div>
  );
}
