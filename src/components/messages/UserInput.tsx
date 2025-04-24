'use client';

/*
 * This Component displays the user's input content (either voice/text/transcript)
 *
 * - text - the content entered or said by the user.
 * - transcript - field to check if the message is the transcript made by LLM
 *    or directly entered by user
 * */

interface UserInputProps {
  text: string;
  transcript: boolean;
}

export default function UserInput(props: UserInputProps) {
  return (
    <>
      <div className="flex flex-row-reverse my-1 max-w-[100%] overflow-hidden animate-in fade-in-100 duration-200">
        <div className="flex flex-col gap-1 py-2 px-4 bg-baseBackground rounded-l-xl rounded-tr-xl text-secText max-w-[100%] sm:max-w-[80%] overflow-hidden">
          <span className="font-medium">{props.text}</span>
          <span className="text-xs opacity-50 self-end">
            {props.transcript ? 'transcript-beta' : ''}
          </span>
        </div>
      </div>
    </>
  );
}
