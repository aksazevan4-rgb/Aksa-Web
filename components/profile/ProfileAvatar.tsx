import { UserAvatar } from "@/components/UserAvatar";
import { getAvatarBorderProps } from "@/lib/profile-themes";

interface Props {
  src?: string | null;
  name?: string | null;
  sizeClassName?: string;
  textClassName?: string;
  className?: string;
  borderStyle?: string | null;
  accentHex: string;
}

/**
 * components/profile/ProfileAvatar.tsx
 * Thin wrapper: UserAvatar + the profile border-style system. Ring styles
 * (gradient/rainbow/animated) need a padded wrapper div; solid styles
 * (glow/neon/soft/etc) apply straight to the avatar. getAvatarBorderProps
 * in lib/profile-themes.ts decides which, this component just plumbs it.
 */
export function ProfileAvatar({ src, name, sizeClassName, textClassName, className = "", borderStyle, accentHex }: Props) {
  const border = getAvatarBorderProps(borderStyle, accentHex);

  const avatar = (
    <UserAvatar
      src={src}
      name={name}
      sizeClassName={sizeClassName}
      textClassName={textClassName}
      className={`${className} ${border.avatarClassName}`}
      style={border.avatarStyle}
    />
  );

  if (!border.wrapperClassName) return avatar;

  return (
    <div className={border.wrapperClassName} style={border.wrapperStyle}>
      {avatar}
    </div>
  );
}
