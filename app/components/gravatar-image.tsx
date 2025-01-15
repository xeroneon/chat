import md5 from "md5";

type Props = {
  email: string;
  size?: number;
};

function GravatarImage({ email, size = 80 }: Props) {
  const hash = md5(email?.trim()?.toLowerCase() ?? "");
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;

  return <img src={gravatarUrl} alt="User avatar" />;
}

export default GravatarImage;
