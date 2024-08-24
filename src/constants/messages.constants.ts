import { TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import { enumValuesToArray } from "~/utils/enumsToArray";

export const UserMessage = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  USER_NOT_FOUND: "Không tìm thấy người dùng",
  USER_ACCOUNT_IS_DEACTIVATED:
    "Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ với quản trị viên để biết thêm thông tin",
  USER_FOUND: "Lấy thông tin người dùng thành công",
  USER_ALREADY_FOLLOWED: "Người dùng đã được theo dõi trước đó",
  OBJECT_ID_INVALID: "ID người dùng không hợp lệ",
  ACCESS_TOKEN_IS_REQUIRED: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống access token)",
  ACCESS_TOKEN_INVALID: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi access token)",
  REFRESH_TOKEN_SUCCESSFULLY: "Refresh token thành công",
  REFRESH_TOKEN_INVALID:
    "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi refresh_token), hãy kiểm tra xem bạn đã sử dụng đúng token hay token đã hết hạn hay chưa hay chưa",
  REFRESH_TOKEN_IS_REQUIRED: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống refresh token)",
  USERNAME_VALIDATION_ERROR:
    "Username cần có độ dài từ 4 tới 15 kí tự và chỉ được có chữ, số, dấu gạch dưới. Và không được chỉ có mỗi số",
  USERNAME_ALREADY_EXISTS: "Username đã có người sử dụng, vui lòng sử dụng một cái khác",
  EMAIL_VERIFY_TOKEN_INVALID:
    "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi email verify token), hãy kiểm tra xem bạn đã sử dụng đúng token hoặc token đã hết hạn hay chưa",
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống email verify token)",
  GOOGLE_ACCOUNT_NOT_VERIFIED: "Tài khoản Google của bạn chưa được xác  thực, vui lòng xác thực trước khi tiếp tục",
  FORGOT_PASSWORD_TOKEN_INVALID:
    "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi sai forgot password token), hãy kiểm tra xem bạn đã sử dụng đúng token hoặc token đã hết hạn hay chưa",
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "Có lỗi đã xảy ra, vui lòng thử lại sau! (Lỗi để trống forgot password token)",
  EMAIL_VERIFY_TOKEN_IS_VERIFIED: "Email đã được xác minh trước đó",
  EMAIL_OR_PASSWORD_IS_INCORRECT: "E-mail hoặc mật khẩu không chính xác",
  NAME_IS_REQUIRED: "Không được để trống tên người dùng",
  NAME_LENGTH_IS_INVALID: "Tên người dùng phải có độ dài từ 1 đến 100 ký tự",
  EMAIL_IS_REQUIRED: "Không được để trống địa chỉ e-mail",
  EMAIL_IS_INVALID: "Địa chỉ e-mail không hợp lệ",
  EMAIL_ALREADY_EXISTS: "Địa chỉ e-mail đã tồn tại, vui lòng sử dụng một e-mail khác",
  EMAIL_DOES_NOT_EXIST: "Địa chỉ e-mail không tồn tại, vui lòng kiểm tra lại",
  PASSWORD_IS_REQUIRED: "Không được để trống mật khẩu",
  PASSWORD_LENGTH_INVALID: "Mật khẩu phải có độ dài từ 6 đến 50 ký tự",
  PASSWORD_MUST_BE_STRONG:
    "Mật khẩu cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
  CHANGE_PASSWORD_SUCCESSFULLY: "Thay đổi mật khẩu thành công!",
  OLD_PASSWORD_IS_MISMATCHED: "Mật khẩu cũ không đúng, vui lòng nhập lại",
  CONFIRM_PASSWORD_IS_REQUIRED: "Không được để trống mật khẩu xác thực",
  CONFIRM_PASSWORD_LENGTH_INVALID: "Mật khẩu xác thực phải có độ dài từ 6 đến 50 ký tự",
  CONFIRM_PASSWORD_INVALID: "Mật khẩu xác thực không khớp",
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    "Mật khẩu xác thực cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
} as const;

export const FollowMessage = {
  NEED_TO_FOLLOW_FIRST: "Bạn cần theo dõi người dùng hiện tại nếu muốn hủy theo dõi họ",
  FOLLOW_SUCCESSFULLY: "Theo dõi người dùng thành công",
  UNFOLLOW_SUCCESSFULLY: "Bỏ theo dõi người dùng thành công",
} as const;

export const MediaMessage = {
  UPLOAD_IMAGE_SUCCESSFULLY: "Upload ảnh thành công",
  UPLOAD_VIDEO_SUCCESSFULLY: "Upload video thành công",
} as const;

export const TweetMessage = {
  TWEET_NOT_FOUND: "Không tìm thấy tweet",
  TWEET_TYPE_MUST_BE_PUBLIC: "Bạn không được phép retweet và quotetweet nếu tweet bật Twitter Circle",
  GET_TWEET_SUCCESSFULLY: "Lấy tweet thành công",
  GET_NEW_FEED_SUCCESSFULLY: "Lấy new feed thành công",
  TWEET_SUCCESSFULLY: "Tạo tweet thành công",
  DELETE_TWEET_SUCCESSFULLY: "Xóa tweet thành công",
  TWEET_TYPE_INVALID: `Đối tượng xem tweet phải là một trong các giá trị sau: ${enumValuesToArray(TweetTypeEnum).join(
    ", ",
  )}`,
  TWEET_AUDIENCE_INVALID: `Kiểu tweet phải là một trong các giá trị sau: ${enumValuesToArray(TweetAudienceEnum).join(
    ", ",
  )}`,
  LIMIT_MUST_BE_GREATER_THAN_SPECIFIED_CONSTANT: "Limit phải lớn hơn ",
  LIMIT_MUST_BE_LESS_THAN_SPECIFIED_CONSTANT: "Limit phải nhỏ hơn ",
  PAGE_MUST_BE_GREATER_THAN_ZERO: "Page phải lớn hơn 0",
  TWEET_INSUFFICIENT_PERMISSION: "Bạn không có quyền xem nội dung này!",
  PARENT_ID_MUST_BE_NULL: "Khi tạo tweet thì parent_id phải là null",
  PARENT_ID_IS_REQUIRED: "Khi retweet, quotetweet và comment thì parent_id là bắt buộc",
  PARENT_ID_CAN_NOT_BE_INVALID: "Khi retweet, quotetweet và comment thì parent_id phải hợp lệ",
  CONTENT_IS_REQUIRED: "Nội dung tweet không được để trống",
  CONTENT_MUST_BE_EMPTY: "Khi retweet thì nội dung tweet phải để trống",
  HASHTAGS_MUST_BE_STRINGS: "Hashtags phải là một mảng chứa các chuỗi",
  MENTIONS_MUST_BE_STRINGS: "Mentions phải là một mảng chứa các user_id",
  MEDIAS_MUST_BE_OBJECTS: "Medias phải là một mảng chứa các medias object có dạng {url: string, type: string}",
  GET_COMMENTS_SUCCESSFULLY: "Lấy danh sách comment thành công",
} as const;

export const BookmarkMessage = {
  GET_BOOKMARKS_SUCCESSFULLY: "Lấy danh sách tweet đã lưu thành công",
  BOOKMARK_SUCCESSFULLY: "Lưu tweet thành công",
  UNBOOKMARK_SUCCESSFULLY: "Bỏ lưu tweet thành công",
  CHECK_BOOKMARK_SUCCESSFULLY: "Kiểm tra tweet đã được lưu thành công",
} as const;

export const SearchMessage = {
  SEARCH_SUCCESSFULLY: "Tìm kiếm thành công",
  SEARCH_QUERY_IS_REQUIRED: "Query không được để trống",
  SEARCH_LIMIT_IS_REQUIRED: "Limit không được để trống",
  SEARCH_PAGE_IS_REQUIRED: "Page không được để trống",
  SEARCH_LIMIT_MUST_BE_A_NUMBER: "Limit phải là một số",
  SEARCH_PAGE_MUST_BE_A_NUMBER: "Page phải là một số",
} as const;
