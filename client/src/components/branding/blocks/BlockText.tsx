import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlockTextProps = {
  content: string;
  layout?: "center" | "left" | "full";
};

const layoutClass: Record<NonNullable<BlockTextProps["layout"]>, string> = {
  center: "max-w-[70ch] mx-auto text-center",
  left: "max-w-[70ch] mx-auto text-left",
  full: "max-w-none",
};

export function BlockText({ content, layout = "center" }: BlockTextProps) {
  return (
    <div className={`prose prose-lg ${layoutClass[layout]}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

