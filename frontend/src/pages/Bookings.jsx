import React, { useState } from "react";
import { Calendar, Clock, MapPin, User, Star, Trash2, ShieldCheck, HelpCircle } from "lucide-react";

export default function Bookings({ bookings, onCancelBooking, onRateBooking }) {
  const [ratingId, setRatingId] = useState(null); // stores booking ID currently being rated
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleRatingSubmit = (e, bookingId) => {
    e.preventDefault();
    onRateBooking(bookingId, ratingVal, reviewText);
    setRatingId(null);
    setRatingVal(5);
    setReviewText("");
  };

  return (
    <div style={{ animation: "fadeInUp 0.4s ease-out", padding: "40px 0" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "10px", letterSpacing: "-0.02em" }}>
        My Bookings
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
        View and manage your scheduled home services, active status tracking, and provide feedback ratings.
      </p>

      {bookings.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {bookings.map((booking) => {
            const isCompleted = booking.status === "Completed";
            const isCancelled = booking.status === "Cancelled";
            const isConfirmed = booking.status === "Confirmed";

            return (
              <div
                key={booking._id}
                className="glass-card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  borderRadius: "20px",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <img
                      src={booking.isCustom ? "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=100&q=80" : booking.service?.image}
                      alt={booking.isCustom ? "Custom Request" : booking.service?.name}
                      style={{ width: "60px", height: "60px", borderRadius: "12px", objectFit: "cover" }}
                    />
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        {booking.isCustom ? "Custom Service Request" : booking.service?.name}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Category: {booking.isCustom ? booking.customCategory : booking.service?.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      className={`badge badge-${
                        isConfirmed ? "confirmed" : isCompleted ? "completed" : isCancelled ? "cancelled" : "pending"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>
                      ₹{booking.totalPrice}
                    </span>
                  </div>
                </div>

                {/* Body Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Calendar size={16} style={{ color: "var(--primary)", marginTop: "2px" }} />
                    <div>
                      <span style={{ display: "block", fontWeight: 700, color: "var(--text-muted)" }}>Date</span>
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <Clock size={16} style={{ color: "var(--primary)", marginTop: "2px" }} />
                    <div>
                      <span style={{ display: "block", fontWeight: 700, color: "var(--text-muted)" }}>Time Slot</span>
                      <span>{booking.timeSlot}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <MapPin size={16} style={{ color: "var(--primary)", marginTop: "2px" }} />
                    <div>
                      <span style={{ display: "block", fontWeight: 700, color: "var(--text-muted)" }}>Delivery Address</span>
                      <span>{booking.address}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <User size={16} style={{ color: "var(--primary)", marginTop: "2px" }} />
                    <div>
                      <span style={{ display: "block", fontWeight: 700, color: "var(--text-muted)" }}>Professional Assigned</span>
                      {booking.professional ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                          <img
                            src={booking.professional.image}
                            alt={booking.professional.name}
                            style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <span>{booking.professional.name}</span>
                        </div>
                      ) : (
                        <span>Auto-Assign Support Team</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Customize and Allergy Warnings */}
                <div
                  style={{
                    background: "var(--bg-main)",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {booking.selectedProduct ? (
                    <div>
                      <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>Product/Brand Chosen: </span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {booking.selectedProduct.name} ({booking.selectedProduct.brand})
                      </span>
                    </div>
                  ) : null}
                  {booking.notes ? (
                    <div>
                      <span style={{ fontWeight: 700, color: "var(--accent)" }}>Special Allergy/Notes Warning: </span>
                      <span style={{ fontStyle: "italic", color: "var(--text-main)" }}>"{booking.notes}"</span>
                    </div>
                  ) : null}
                  {booking.isCustom && booking.customDescription ? (
                    <div>
                      <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>Requirements Details: </span>
                      <span style={{ color: "var(--text-main)" }}>"{booking.customDescription}"</span>
                    </div>
                  ) : null}
                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <span>
                      Payment: <strong style={{ color: booking.paymentStatus === "Paid" ? "var(--success)" : "var(--warning)" }}>{booking.paymentStatus}</strong> ({booking.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Rating Display if already rated */}
                {booking.userRating ? (
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      paddingTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      Your Review Rating:
                    </span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= booking.userRating ? "var(--warning)" : "none"}
                          stroke={s <= booking.userRating ? "var(--warning)" : "#cbd5e1"}
                        />
                      ))}
                    </div>
                    {booking.userReview && (
                      <span style={{ fontSize: "0.85rem", fontStyle: "italic", color: "var(--text-muted)" }}>
                        - "{booking.userReview}"
                      </span>
                    )}
                  </div>
                ) : null}

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "16px",
                  }}
                >
                  {isConfirmed && (
                    <button onClick={() => onCancelBooking(booking._id)} className="btn btn-secondary btn-danger">
                      <Trash2 size={16} /> Cancel Service
                    </button>
                  )}

                  {!booking.userRating && (isConfirmed || isCompleted) && ratingId !== booking._id && (
                    <button
                      onClick={() => setRatingId(booking._id)}
                      className="btn btn-primary"
                      style={{ background: "var(--success)", boxShadow: "none" }}
                    >
                      <Star size={16} /> Rate Experience
                    </button>
                  )}
                </div>

                {/* Expandable Rate Form */}
                {ratingId === booking._id && (
                  <form
                    onSubmit={(e) => handleRatingSubmit(e, booking._id)}
                    style={{
                      background: "var(--primary-light)",
                      padding: "20px",
                      borderRadius: "16px",
                      marginTop: "10px",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <h4 style={{ fontWeight: 700, marginBottom: "12px", fontSize: "0.95rem" }}>
                      Rate the service and professional
                    </h4>
                    
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                        Select Stars:
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setRatingVal(s)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          >
                            <Star
                              size={24}
                              fill={s <= ratingVal ? "var(--warning)" : "none"}
                              stroke={s <= ratingVal ? "var(--warning)" : "#94a3b8"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Write Review / Feedback</label>
                      <input
                        type="text"
                        placeholder="E.g., Great cleanup, polite stylist! Highly recommend."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        style={{ background: "#ffffff" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setRatingId(null)}
                        className="btn btn-secondary"
                        style={{ padding: "8px 16px" }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px" }}>
                        Submit Rating
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: "60px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <HelpCircle size={48} color="var(--text-muted)" />
          <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>No bookings scheduled yet.</p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Go to the Services tab to book professional services like parlour, plumbers, or AC repair.
          </p>
        </div>
      )}
    </div>
  );
}
