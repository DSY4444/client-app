import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Card, CircularProgress, Icon, IconButton, Stack, TextField } from "@mui/material";
import MDAvatar from "components/MDAvatar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import useFetchRequest from "hooks/useFetchRequest";
import { useImmer } from "use-immer";
import fetchRequest from "utils/fetchRequest";
import { useAppController } from "context";
import { useYADialog } from "components/YADialog";
import EmptyState from "components/EmptyState";
import moment from "moment";
import YAScrollbar from "components/YAScrollbar";

const commentStyle = (theme, { selfComment }) => {
    const selfCommentStyles = {
        borderBottomRightRadius: 0,
        mr: 2,
        ml: 4
    };

    const othersCommentStyles = {
        borderTopLeftRadius: 0,
        ml: 2,
        mr: 4,
    };

    return {
        background: "#f9f7f7",
        my: 1.25,
        borderRadius: 4,
        "& .commentBox": {
            pt: .75,
            pb: 1,
            pl: 1.5,
            pr: 1,
        },
        "& .parentComment": {
            mt: 1,
            mx: 1,
            px: 1,
            pt: 1,
            pb: .5,
            borderRadius: 3,
            background: "#fcfcfc!important",
            border: "1px solid rgba(0, 0, 0, 0.125)"
        },
        ...(selfComment && selfCommentStyles),
        ...(!selfComment && othersCommentStyles)
    }
}

const CommentTextArea = props => {
    const { text } = props;
    const textOverflowed = (text || "").length > 110;
    const [expanded, setExpanded] = useState(false);
    return (
        <MDTypography component="p" color="dark" variant="button" sx={{ whiteSpace: "normal" }}>
            {!textOverflowed && text}
            {textOverflowed && (
                <>
                    {expanded ? text : `${(text || "").substring(0, 110)}...`}
                    <MDTypography
                        component="span"
                        variant="caption"
                        color="info"
                        ml={1}
                        sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                        onClick={() => setExpanded(s => !s)}
                    >
                        {expanded ? "Show less" : "Show more"}
                    </MDTypography>
                </>
            )}
        </MDTypography>
    );
}

const Comment = props => {
    const { mode, comment, onEdit, onReply, onDelete } = props;
    const [commentText, setCommentText] = useState(comment?.commentText);
    const [editingComm, setEditingComm] = useState(false);
    const [commentTextError, setCommentTextError] = useState(false);
    const [controller] = useAppController();
    const { userInfo } = controller;
    const selfComment = userInfo?.sub.toLowerCase() === comment?.createdBy.toLowerCase();
    const commentTxtRef = useRef();

    useEffect(() => {
        commentTxtRef.current?.focus();
    }, [editingComm])

    return (
        <Card sx={theme => commentStyle(theme, { selfComment })}>
            {Boolean(comment?.isReply) && (
                <MDBox className="parentComment">
                    {
                        comment?.parentCommentId && (<>
                            <Stack
                                spacing={1}
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Stack spacing={1} direction="row" alignItems="center">
                                    <MDAvatar name={comment["parentComment.createdByUser.name"]} size="xs" />
                                    <MDTypography variant="caption" color="dark" fontWeight="medium">
                                        {comment["parentComment.createdByUser.name"]}
                                    </MDTypography>
                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                        {comment["parentComment.createdAt"] ? moment(comment["parentComment.createdAt"]).format("MMM DD YYYY, hh:mm A") : ""}
                                    </MDTypography>
                                </Stack>
                            </Stack>
                            <CommentTextArea text={comment["parentComment.commentText"]} />
                        </>
                        )
                    }
                    {
                        !comment?.parentCommentId && (
                            <MDTypography p={.5} component="p" variant="caption" color="text" fontWeight="medium">
                                This message has been deleted
                            </MDTypography>
                        )
                    }
                </MDBox>
            )
            }
            <MDBox className="commentBox">
                <Stack
                    spacing={1}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Stack spacing={1} direction="row" alignItems="center">
                        {
                            !selfComment && (
                                <>
                                    <MDAvatar name={comment["createdByUser.name"]} size="xs" />
                                    <MDTypography variant="caption" color="dark" fontWeight="medium">
                                        {comment["createdByUser.name"]}
                                    </MDTypography>
                                </>
                            )
                        }
                        <MDTypography variant="caption" color="text" fontWeight="medium">
                            {comment?.createdAt ? moment(comment?.createdAt).format("MMM DD YYYY, hh:mm A") : ""}
                        </MDTypography>
                    </Stack>
                    {
                        mode === "edit" &&
                        <>
                            {userInfo?.sub.toLowerCase() === comment?.createdBy.toLowerCase() ? (
                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        title="Click to edit"
                                        size="small"
                                        disabled={editingComm}
                                        onClick={() => setEditingComm(!editingComm)}
                                    >
                                        <Icon>edit</Icon>
                                    </IconButton>
                                    <IconButton
                                        title="Click to delete"
                                        size="small"
                                        onClick={() => onDelete(comment?.id)}
                                    >
                                        <Icon>delete</Icon>
                                    </IconButton>
                                </Stack>
                            ) : (
                                <IconButton
                                    title="Click to reply"
                                    size="small"
                                    onClick={() => onReply(comment)}
                                >
                                    <Icon>reply</Icon>
                                </IconButton>
                            )
                            }
                        </>
                    }
                </Stack>
                {editingComm ? (
                    <>
                        <TextField inputRef={commentTxtRef}
                            multiline
                            fullWidth
                            rows={2}
                            maxRows={2}
                            placeholder="Add a comment to continue..."
                            value={commentText}
                            helperText={`${(commentText || "").trim().length}/500`}
                            sx={{
                                my: 1,
                                "& .MuiOutlinedInput-root": {
                                    background: "#fff"
                                },
                                "& .MuiFormHelperText-root": {
                                    textAlign: "right",
                                    fontWeight: "600",
                                    marginRight: 1,
                                    marginTop: .75
                                }
                            }}
                            onChange={({ target: { value } }) => {
                                if (value?.trim().length > 500) {
                                    setCommentTextError(true)
                                    setCommentText(value?.substring(0, 500))
                                }
                                else {
                                    setCommentTextError(false)
                                    setCommentText(value)
                                }
                            }}
                            error={commentTextError}
                        />
                        <Stack direction="row-reverse" spacing={1}>
                            <IconButton
                                size="small"
                                sx={{
                                    backgroundColor: "green!important",
                                    color: "white!important",
                                }}
                                onClick={() => {
                                    if (!commentText.trim())
                                        setCommentTextError(true)
                                    else {
                                        onEdit(
                                            comment?.id,
                                            commentText.trim(),
                                            () => setEditingComm(!editingComm)
                                        );
                                    }
                                }}
                            >
                                <Icon>done</Icon>
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={{
                                    backgroundColor: "red!important",
                                    color: "white!important",
                                }}
                                onClick={() => setEditingComm(!editingComm)}
                            >
                                <Icon>close</Icon>
                            </IconButton>
                        </Stack>
                    </>
                ) : (
                    <CommentTextArea text={comment?.commentText} />
                )}
            </MDBox>
        </Card >
    )
}

const replyingCommentStyles = (theme, { replying }) => {
    const commentStyles = {
        "& .replyingCommentBox": {
            position: "relative",
            p: 1,
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.125)",
        },
        "& .replyingComment": {
            mb: 1,
            px: 1,
            pt: 1,
            pb: .5,
            borderRadius: 3,
            background: "#f9f7f7!important",
            border: "1px solid rgba(0, 0, 0, 0.125)"
        }
    }
    return ({
        flex: 1,
        display: "flex",
        flexDirection: "column",
        mr: 2,
        ...(replying && commentStyles)
    })
};

const CommentsDrawer = props => {
    const { mode, commentType, commentTypePkId } = props;
    const { response, error, loading, reloadData } = useFetchRequest(`/api/comment/${commentType}/list/${commentTypePkId}`);
    const [comments, setComments] = useImmer([]);
    const [commentText, setCommentText] = useState(null);
    const [replyingComment, setReplyingComment] = useState(null);
    const [commentTextError, setCommentTextError] = useState(false);
    const { showAlert, showPrompt, showSnackbar } = useYADialog();
    const scrollbarRef = useRef();
    const commentTxtRef = useRef();

    useEffect(() => {
        if (!loading) {
            if (error !== null) {
                console.error(error)
            }
            else if (response !== null) {
                setComments(response);
            }
        }
    }, [loading, response]);

    useEffect(() => {
        commentTxtRef.current?.focus();
    }, [loading])

    useLayoutEffect(() => {
        if (scrollbarRef?.current) {
            scrollbarRef.current.scrollIntoView();
        }
    });

    const handleClose = useCallback(() => {
        if (props.onClose)
            props.onClose();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText || commentText?.trim() === "") {
            setCommentTextError(true);
        } else {
            let modelData = {
                commentText: commentText?.trim(),
                parentCommentId: replyingComment?.id
            };
            setCommentTextError(false);
            setReplyingComment(null);
            const response = await fetchRequest.post(`/api/comment/${commentType}/list/${commentTypePkId}/new`, JSON.stringify(modelData));
            if (response.data && response.data.result === false) {
                if (Array.isArray(response.data.errors) && response.data.errors.length > 0) {
                    // response.data.errors.forEach((e) => {
                    //     setError(e.field, { type: "manual", message: e.message });
                    // });
                }
            }
            else {
                setCommentText(null);
                reloadData();
                // handleClose();
                // showSnackbar(response.data.message, "success");
            }
        }
    };

    const handleEdit = async (pkId, commentStr, onSuccess) => {
        const [err, data] = await fetchRequest.post(`/api/comment/${pkId}`, JSON.stringify({ commentText: commentStr }));
        if (data && data.result === true) {
            showSnackbar(data.message, "success");
            reloadData();
            if (onSuccess)
                onSuccess();
        }
        else {
            console.error(err);
            showAlert("Edit Comment", "Something went wrong. Contact your administrator.");
        }
    }

    const deleteComment = async (pkId) => {
        const [err, data] = await fetchRequest.delete(`/api/comment/${pkId}`);
        if (data && data.result === true) {
            // showSnackbar(data.message, "success");
            reloadData();
        }
        else {
            console.error(err);
            showAlert("Delete Comment", "Something went wrong. Contact your administrator.");
        }
    }

    const handleDelete = (pkId) => {
        showPrompt("Delete Comment", "Are you sure you want to delete the comment?", () => deleteComment(pkId));
    }

    const handleReply = (comment) => {
        setReplyingComment(comment);
        commentTxtRef.current?.focus();
    }

    return <MDBox height="100vh" display="flex" flexDirection="column">
        <Icon
            sx={() => ({
                cursor: "pointer",
                position: "absolute",
                right: 16,
                top: 8
            })}
            onClick={handleClose}
        >
            close
        </Icon>
        {
            loading && (
                <MDBox flex={1} display="flex" alignItems="center" justifyContent="center" mt={4}>
                    <CircularProgress color="info" />
                </MDBox>
            )
        }
        {
            !loading && (!comments || comments.length === 0) && (
                <MDBox flex={1} display="flex" alignItems="center" justifyContent="center" mt={4}>
                    <EmptyState
                        size="medium"
                        iconName="forum"
                        description={"No Comments Found"}
                        variant="text"
                    />
                </MDBox>
            )
        }
        {
            !loading && (comments && comments.length > 0) && (
                <MDBox flex={1} overflow="hidden" mt={4}>
                    <YAScrollbar>
                        <MDBox minHeight="calc(100vh - 148px)" display="flex" flexDirection="column" justifyContent="flex-end">
                            {
                                comments && comments?.map(
                                    c => (
                                        <Comment key={c.id} mode={mode} comment={c} onEdit={handleEdit} onReply={handleReply} onDelete={handleDelete} />
                                    )
                                )
                            }
                            <span ref={scrollbarRef} />
                        </MDBox>
                    </YAScrollbar>
                </MDBox>
            )
        }
        {
            (!loading && mode === "edit") && (
                <form onSubmit={handleSubmit} noValidate={true}>
                    <MDBox display="flex" p={2} pb={1.5} alignItems="flex-end">
                        <MDBox sx={(theme) => replyingCommentStyles(theme, { replying: replyingComment !== null })}>
                            <MDBox className="replyingCommentBox">
                                {
                                    replyingComment && (
                                        <>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    position: "absolute",
                                                    right: -12,
                                                    top: -12
                                                }}
                                                onClick={() => setReplyingComment(null)}
                                            >
                                                <Icon>cancel</Icon>
                                            </IconButton>
                                            <MDBox className="replyingComment">
                                                <Stack
                                                    spacing={1}
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >
                                                    <Stack spacing={1} direction="row" alignItems="center">
                                                        <MDAvatar name={replyingComment["createdByUser.name"]} size="xs" />
                                                        <MDTypography variant="caption" color="dark" fontWeight="medium">
                                                            {replyingComment["createdByUser.name"]}
                                                        </MDTypography>
                                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                                            {replyingComment?.createdAt ? moment(replyingComment?.createdAt).format("MMM DD YYYY, hh:mm A") : ""}
                                                        </MDTypography>
                                                    </Stack>
                                                </Stack>
                                                <CommentTextArea text={replyingComment?.commentText} />
                                            </MDBox>
                                        </>
                                    )
                                }

                                <TextField inputRef={commentTxtRef}
                                    name="commentText"
                                    placeholder="Add a comment..."
                                    value={commentText || ""}
                                    multiline
                                    rows={2}
                                    maxRows={2}
                                    fullWidth
                                    sx={{
                                        "& .MuiFormHelperText-root": {
                                            textAlign: "right",
                                            fontWeight: "600",
                                            marginRight: 1,
                                            marginTop: .75
                                        }
                                    }}
                                    onChange={({ target: { value } }) => {
                                        if (value?.trim().length > 500) {
                                            setCommentTextError(true)
                                            setCommentText(value?.substring(0, 500))
                                        }
                                        else {
                                            setCommentTextError(false)
                                            setCommentText(value)
                                        }
                                    }}
                                    error={commentTextError}
                                />
                            </MDBox>
                            <MDTypography component="p" variant="caption" color="text" fontWeight="medium" sx={{ mt: 1, ml: "auto" }}>
                                {`${(commentText || "").trim().length}/500`}
                            </MDTypography>
                        </MDBox>
                        <IconButton type="submit" size="large" title="Click to post comment"
                            sx={{
                                height: 48, width: 48, borderRadius: "50%",
                                mb: 4,
                                backgroundColor: "blue!important",
                                color: "white!important",
                                "& .MuiIcon-root": {
                                    transform: "rotate(-20deg)",
                                    ml: .5,
                                    mt: -.5
                                }
                            }}
                        >
                            <Icon>send</Icon>
                        </IconButton>
                    </MDBox>
                </form>
            )
        }
    </MDBox>
}

export default CommentsDrawer;